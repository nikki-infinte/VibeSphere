from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="user")
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    events: Mapped[list["Event"]] = relationship(back_populates="host")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="user")
    interactions: Mapped[list["UserEventInteraction"]] = relationship(back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(60), index=True)
    event_date: Mapped[datetime] = mapped_column(DateTime, index=True)
    venue_name: Mapped[str] = mapped_column(String(160))
    latitude: Mapped[float] = mapped_column(Float, index=True)
    longitude: Mapped[float] = mapped_column(Float, index=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    capacity: Mapped[int] = mapped_column(Integer)
    tickets_available: Mapped[int] = mapped_column(Integer)
    image_url: Mapped[str | None] = mapped_column(String(400), nullable=True)
    views: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    host: Mapped["User"] = relationship(back_populates="events")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="event")
    interactions: Mapped[list["UserEventInteraction"]] = relationship(back_populates="event")


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (UniqueConstraint("user_id", "event_id", name="uq_user_event_booking"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(20), default="confirmed")
    booked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="bookings")
    event: Mapped["Event"] = relationship(back_populates="bookings")


class UserEventInteraction(Base):
    __tablename__ = "user_event_interactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), index=True)
    interaction_type: Mapped[str] = mapped_column(String(30))
    weight: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="interactions")
    event: Mapped["Event"] = relationship(back_populates="interactions")
