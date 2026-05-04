from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db import Base, engine
from app.models import Event, User
from app.routes.auth import router as auth_router
from app.routes.bookings import router as booking_router
from app.routes.chatbot import router as chatbot_router
from app.routes.discover import router as discover_router
from app.routes.events import router as events_router

app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    seed_dummy_data()


def seed_dummy_data():
    with Session(engine) as db:
        existing_events = db.query(Event).count()
        if existing_events > 0:
            return

        host = db.query(User).filter(User.email == "host.demo@example.com").first()
        if not host:
            host = User(
                email="host.demo@example.com",
                full_name="Demo Host",
                password_hash=hash_password("Demo@12345"),
                role="host",
                city="Delhi",
                latitude=28.6139,
                longitude=77.2090,
            )
            db.add(host)
            db.flush()

        demo_events = [
            Event(
                host_id=host.id,
                title="Delhi Food Carnival",
                description="Street food, live music, and weekend vibes.",
                category="Food",
                event_date=datetime.utcnow() + timedelta(days=2),
                venue_name="Connaught Place",
                latitude=28.6315,
                longitude=77.2167,
                price=299,
                capacity=200,
                tickets_available=200,
                image_url=None,
            ),
            Event(
                host_id=host.id,
                title="Tech Meetup NCR",
                description="Startup networking and AI talks.",
                category="Technology",
                event_date=datetime.utcnow() + timedelta(days=4),
                venue_name="Noida Expo Center",
                latitude=28.5672,
                longitude=77.3210,
                price=0,
                capacity=300,
                tickets_available=300,
                image_url=None,
            ),
            Event(
                host_id=host.id,
                title="Weekend Live Concert",
                description="Open-air concert with indie bands.",
                category="Music",
                event_date=datetime.utcnow() + timedelta(days=6),
                venue_name="Gurugram Arena",
                latitude=28.4595,
                longitude=77.0266,
                price=799,
                capacity=500,
                tickets_available=500,
                image_url=None,
            ),
        ]
        db.add_all(demo_events)
        db.commit()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(events_router)
app.include_router(discover_router)
app.include_router(booking_router)
app.include_router(chatbot_router)
