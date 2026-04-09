import heapq

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Booking, Event


def top_k_trending_events(db: Session, k: int = 10) -> list[Event]:
    rows = (
        db.query(Event, func.coalesce(func.sum(Booking.quantity), 0).label("booked"))
        .outerjoin(Booking, Booking.event_id == Event.id)
        .filter(Event.is_active.is_(True))
        .group_by(Event.id)
        .all()
    )

    heap: list[tuple[int, int]] = []
    scores: dict[int, int] = {}
    for event, booked in rows:
        score = int(booked) * 3 + event.views
        scores[event.id] = score
        heapq.heappush(heap, (-score, event.id))

    top_ids = []
    for _ in range(min(k, len(heap))):
        _, event_id = heapq.heappop(heap)
        top_ids.append(event_id)

    if not top_ids:
        return []

    events = db.query(Event).filter(Event.id.in_(top_ids)).all()
    return sorted(events, key=lambda e: scores[e.id], reverse=True)
