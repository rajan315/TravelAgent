"""Q&A chat endpoint."""

import asyncio

from fastapi import APIRouter, HTTPException

from core.bedrock import get_bedrock_client
from core.models import ChatRequest
from core.qa import run_qa_turn
from backend.state import sessions

router = APIRouter()


@router.post("/research/{session_id}/chat")
async def chat(session_id: str, req: ChatRequest):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id]
    if session.status != "complete":
        raise HTTPException(status_code=400, detail="Research not yet complete")

    bedrock_client = get_bedrock_client()

    answer = await asyncio.to_thread(
        run_qa_turn,
        bedrock_client,
        session.qa_system_prompt,
        session.qa_messages,
        req.question,
    )

    return {"answer": answer}
