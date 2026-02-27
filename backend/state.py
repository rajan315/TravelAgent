"""In-memory session store for research sessions."""

from __future__ import annotations
import queue
import threading
from dataclasses import dataclass, field


@dataclass
class ResearchSession:
    session_id: str
    prefs: dict
    results: dict = field(default_factory=dict)       # phase_id -> markdown
    total_searches: int = 0
    status: str = "running"                            # running | complete | error
    event_queue: queue.Queue = field(default_factory=queue.Queue)
    qa_system_prompt: str = ""
    qa_messages: list = field(default_factory=list)    # conversation history for Q&A
    lock: threading.Lock = field(default_factory=threading.Lock)


# Global session store
sessions: dict[str, ResearchSession] = {}
