"""Research endpoints: start research + SSE stream."""

import asyncio
import json
import threading
import uuid

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from core.bedrock import get_bedrock_client
from core.models import TripPreferences
from core.phases import PHASES
from core.research import run_phase
from core.qa import create_qa_system_prompt
from backend.state import ResearchSession, sessions

router = APIRouter()


def _run_research_thread(session: ResearchSession):
    """Background thread: runs all 5 phases and pushes events to session.event_queue."""
    q = session.event_queue
    bedrock_client = get_bedrock_client()
    total_searches = 0

    for i, phase in enumerate(PHASES):
        phase_id = phase["id"]

        q.put(("phase_start", {
            "phase_id": phase_id,
            "phase_index": i,
            "title": phase["title"],
        }))

        def on_event(event_type, data, _pid=phase_id):
            if event_type == "search":
                q.put(("search", {
                    "phase_id": _pid,
                    "query": data["query"],
                    "count": data["count"],
                }))

        try:
            markdown, searches = run_phase(
                bedrock_client, phase, session.prefs, session.results, on_event=on_event
            )
            with session.lock:
                session.results[phase_id] = markdown
                total_searches += searches
                session.total_searches = total_searches

            q.put(("phase_complete", {
                "phase_id": phase_id,
                "searches": searches,
                "markdown": markdown,
            }))
        except Exception as e:
            q.put(("phase_error", {
                "phase_id": phase_id,
                "error": str(e),
            }))

    # Build QA system prompt now that all results are ready
    with session.lock:
        session.qa_system_prompt = create_qa_system_prompt(session.prefs, session.results)
        session.status = "complete"

    q.put(("research_complete", {"total_searches": total_searches}))


@router.post("/research")
async def start_research(prefs: TripPreferences):
    session_id = uuid.uuid4().hex[:12]
    session = ResearchSession(
        session_id=session_id,
        prefs=prefs.model_dump(),
    )
    sessions[session_id] = session

    thread = threading.Thread(target=_run_research_thread, args=(session,), daemon=True)
    thread.start()

    return {"session_id": session_id}


@router.get("/research/{session_id}/stream")
async def stream_research(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id]

    async def event_generator():
        while True:
            try:
                event_type, data = await asyncio.to_thread(session.event_queue.get, timeout=1.0)
                yield {"event": event_type, "data": json.dumps(data)}
                if event_type == "research_complete":
                    return
            except Exception:
                # queue.Empty — send heartbeat
                if session.status in ("complete", "error"):
                    return
                yield {"event": "heartbeat", "data": ""}

    return EventSourceResponse(event_generator())
