from sqlalchemy.orm import Session

import httpx

from app.core.config import settings
from app.models import Event


BOT_NAME = "VibeScout"


def _events_context(db: Session, latitude: float | None, longitude: float | None) -> str:
    query = db.query(Event).filter(Event.is_active.is_(True))
    events = query.order_by(Event.event_date.asc()).limit(8).all()
    if not events:
        return "No events currently available."

    lines = []
    for event in events:
        lines.append(
            f"- {event.title} ({event.category}) on {event.event_date.date()} at {event.venue_name}, "
            f"price: {event.price}, lat/lon: {event.latitude}/{event.longitude}"
        )
    return "\n".join(lines)


async def chat_with_llm(message: str, db: Session, latitude: float | None, longitude: float | None) -> tuple[str, str]:
    context = _events_context(db, latitude, longitude)
    system_prompt = (
        f"You are {BOT_NAME}, an event concierge for Smart Event Discovery. "
        "Recommend practical nearby events and weekend plans. Keep answers short and actionable."
    )

    payload = {
        "model": settings.ollama_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Events data:\n{context}\n\nUser request: {message}"},
        ],
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=25) as client:
            response = await client.post(f"{settings.ollama_base_url}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data["message"]["content"], "ollama"
    except Exception:
        fallback = (
            f"{BOT_NAME} quick picks: check Trending tab, then filter by category + date. "
            "I could not reach the LLM right now, but your local recommendations API is still available."
        )
        return fallback, "fallback"
