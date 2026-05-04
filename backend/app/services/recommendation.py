from collections import defaultdict
from datetime import datetime
from math import asin, cos, radians, sin, sqrt

from sqlalchemy.orm import Session

from app.models import Event, User, UserEventInteraction
from app.services.trending import top_k_trending_events


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    lat1 = radians(lat1)
    lat2 = radians(lat2)
    a = sin(d_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(d_lon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


def recommend_for_user(db: Session, user: User, limit: int = 8) -> list[Event]:
    now = datetime.utcnow()
    preferences = defaultdict(int)
    interactions = db.query(UserEventInteraction).filter(UserEventInteraction.user_id == user.id).all()
    for interaction in interactions:
        event = db.query(Event).filter(Event.id == interaction.event_id).first()
        if event:
            preferences[event.category] += interaction.weight

    candidates = (
        db.query(Event)
        .filter(Event.is_active.is_(True))
        .filter(Event.event_date >= now)
        .filter(Event.tickets_available > 0)
        .all()
    )
    ranking: list[tuple[float, Event]] = []
    for event in candidates:
        score = float(preferences[event.category])
        if user.latitude is not None and user.longitude is not None:
            distance = haversine_km(user.latitude, user.longitude, event.latitude, event.longitude)
            score += max(0, 25 - distance)
        ranking.append((score, event))

    ranking.sort(key=lambda x: x[0], reverse=True)
    top = [event for _, event in ranking[:limit]]
    if len(top) < limit:
        existing = {e.id for e in top}
        for event in top_k_trending_events(db, k=limit):
            if event.id not in existing:
                top.append(event)
            if len(top) == limit:
                break
    return top
