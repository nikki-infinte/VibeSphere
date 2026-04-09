from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.cache import LRUCache
from app.deps import get_current_user, get_db, require_host
from app.models import Event, User, UserEventInteraction
from app.schemas import EventCreate, EventOut, EventUpdate
from app.services.search import event_trie

router = APIRouter(prefix="/events", tags=["events"])
event_list_cache: LRUCache[str, list[Event]] = LRUCache(capacity=200, ttl_seconds=30)


@router.post("/", response_model=EventOut)
def create_event(payload: EventCreate, host: User = Depends(require_host), db: Session = Depends(get_db)):
    event = Event(
        host_id=host.id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        event_date=payload.event_date,
        venue_name=payload.venue_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price=payload.price,
        capacity=payload.capacity,
        tickets_available=payload.capacity,
        image_url=payload.image_url,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    event_trie.insert(event.title, event.id)
    return event


@router.get("/", response_model=list[EventOut])
def list_events(
    category: str | None = None,
    start_date: datetime | None = None,
    db: Session = Depends(get_db),
):
    key = f"events:{category}:{start_date}"
    cached = event_list_cache.get(key)
    if cached is not None:
        return cached

    query = db.query(Event).filter(Event.is_active.is_(True))
    if category:
        query = query.filter(Event.category.ilike(category))
    if start_date:
        query = query.filter(Event.event_date >= start_date)
    items = query.order_by(Event.event_date.asc()).limit(200).all()
    event_list_cache.put(key, items)
    return items


@router.get("/autocomplete")
def autocomplete(q: str = Query(min_length=1), db: Session = Depends(get_db)):
    event_ids = event_trie.search_prefix(q)
    if not event_ids:
        return {"results": []}
    events = db.query(Event).filter(Event.id.in_(event_ids)).all()
    return {"results": [{"id": e.id, "title": e.title} for e in events]}


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.is_active.is_(True)).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    event.views += 1
    db.add(UserEventInteraction(user_id=user.id, event_id=event.id, interaction_type="view", weight=1))
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    host: User = Depends(require_host),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id, Event.host_id == host.id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(event_id: int, host: User = Depends(require_host), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id, Event.host_id == host.id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    event.is_active = False
    db.commit()
    return {"message": "Event deactivated"}
