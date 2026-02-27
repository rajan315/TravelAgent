"""Results and download endpoints."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse

from core.save import save_full_plan
from backend.state import sessions

router = APIRouter()


@router.get("/research/{session_id}/results")
async def get_results(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id]
    return {
        "status": session.status,
        "results": session.results,
        "total_searches": session.total_searches,
        "prefs": session.prefs,
    }


@router.get("/research/{session_id}/download")
async def download_plan(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id]
    if not session.results:
        raise HTTPException(status_code=400, detail="No results yet")

    filename, content = save_full_plan(session.results, session.prefs)

    return PlainTextResponse(
        content=content,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
