from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.schemas import ChatRequest, ChatResponse
from app.services.chatbot import BOT_NAME, chat_with_llm

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


@router.get("/name")
def bot_name():
    return {"name": BOT_NAME}


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    _=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reply, source = await chat_with_llm(payload.message, db, payload.latitude, payload.longitude)
    return ChatResponse(reply=reply, source=source)
