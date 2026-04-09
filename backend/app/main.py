from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db import Base, engine
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


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(events_router)
app.include_router(discover_router)
app.include_router(booking_router)
app.include_router(chatbot_router)
