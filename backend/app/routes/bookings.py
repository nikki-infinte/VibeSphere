from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Booking, Event, User, UserEventInteraction
from app.schemas import BookingCreate, BookingOut

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=BookingOut)
def create_booking(
    payload: BookingCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Concurrency-safe booking: transaction + row-level lock on event row.
    try:
        event = (
            db.query(Event)
            .filter(Event.id == payload.event_id, Event.is_active.is_(True))
            .with_for_update()
            .first()
        )
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        if event.event_date < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Event is unavailable for booking",
            )
        if event.tickets_available < payload.quantity:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Not enough tickets")

        event.tickets_available -= payload.quantity
        booking = Booking(
            user_id=user.id,
            event_id=event.id,
            quantity=payload.quantity,
            total_amount=float(event.price) * payload.quantity,
            status="confirmed",
        )
        db.add(booking)
        db.add(UserEventInteraction(user_id=user.id, event_id=event.id, interaction_type="booking", weight=5))
        db.commit()
        db.refresh(booking)
        return booking
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate booking not allowed")


@router.get("/mine", response_model=list[BookingOut])
def my_bookings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.user_id == user.id).order_by(Booking.booked_at.desc()).all()
