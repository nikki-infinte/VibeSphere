from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="user", pattern="^(user|host)$")
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: str
    city: str | None
    latitude: float | None
    longitude: float | None


class EventBase(BaseModel):
    title: str
    description: str
    category: str
    event_date: datetime
    venue_name: str
    latitude: float
    longitude: float
    price: Decimal
    capacity: int = Field(gt=0)
    image_url: str | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    event_date: datetime | None = None
    venue_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price: Decimal | None = None
    capacity: int | None = Field(default=None, gt=0)
    image_url: str | None = None
    is_active: bool | None = None


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    host_id: int
    title: str
    description: str
    category: str
    event_date: datetime
    venue_name: str
    latitude: float
    longitude: float
    price: Decimal
    capacity: int
    tickets_available: int
    image_url: str | None
    views: int
    is_active: bool


class BookingCreate(BaseModel):
    event_id: int
    quantity: int = Field(default=1, ge=1, le=10)


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    event_id: int
    quantity: int
    total_amount: Decimal
    status: str
    booked_at: datetime


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=500)
    latitude: float | None = None
    longitude: float | None = None


class ChatResponse(BaseModel):
    reply: str
    source: str
