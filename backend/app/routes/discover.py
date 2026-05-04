from math import asin, cos, radians, sin, sqrt

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Event, User
from app.schemas import EventOut
from app.services.recommendation import recommend_for_user
from app.services.trending import top_k_trending_events

router = APIRouter(prefix="/discover", tags=["discover"])


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    lat1 = radians(lat1)
    lat2 = radians(lat2)
    a = sin(d_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(d_lon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


@router.get("/nearby", response_model=list[EventOut])
def nearby(
    lat: float,
    lon: float,
    distance_km: float = Query(default=20, ge=1, le=200),
    category: str | None = None,
    db: Session = Depends(get_db),
):
    # Bounding box first to avoid brute-force global scan.
    lat_delta = distance_km / 111.0
    lon_delta = distance_km / (111.0 * max(cos(radians(lat)), 0.01))
    q = (
        db.query(Event)
        .filter(Event.is_active.is_(True))
        .filter(Event.latitude.between(lat - lat_delta, lat + lat_delta))
        .filter(Event.longitude.between(lon - lon_delta, lon + lon_delta))
    )
    if category:
        q = q.filter(Event.category.ilike(category))
    candidates = q.all()

    filtered = [e for e in candidates if haversine_km(lat, lon, e.latitude, e.longitude) <= distance_km]
    if filtered:
        return sorted(filtered, key=lambda e: haversine_km(lat, lon, e.latitude, e.longitude))

    # Fallback: return closest active events if none found in requested radius.
    all_events = db.query(Event).filter(Event.is_active.is_(True)).all()
    all_events.sort(key=lambda e: haversine_km(lat, lon, e.latitude, e.longitude))
    return all_events[:10]


@router.get("/trending", response_model=list[EventOut])
def trending(db: Session = Depends(get_db), k: int = Query(default=10, ge=1, le=50)):
    return top_k_trending_events(db, k=k)


@router.get("/recommended", response_model=list[EventOut])
def recommended(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recommend_for_user(db, user)
