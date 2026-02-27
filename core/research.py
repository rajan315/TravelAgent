"""Research phase runner with callback-based event reporting."""

from core.bedrock import (
    call_bedrock_converse,
    build_assistant_message,
    extract_text_from_response,
    get_tool_uses,
)
from core.search import get_web_search_tool, execute_web_search


def get_phase_max_tokens(phase_id, trip_days):
    """Calculate max tokens based on phase type and trip length."""
    if phase_id == "itinerary":
        return min(max(trip_days * 2000, 8000), 32000)
    if phase_id == "hotels":
        return min(max(trip_days * 500, 8000), 16000)
    return 8000


def build_context(prefs):
    """Build context string from preferences."""
    return f"""Trip Details:
- Destination: {prefs['destination']}
- Departing from: {prefs.get('departing_from', 'N/A')}
- Nationality: {prefs.get('nationality', 'N/A')}
- Duration: {prefs['days']} days
- Travel dates: {prefs.get('travel_dates', 'flexible')}
- Travelers: {prefs.get('travelers', '1 adult')}
- Budget: {prefs.get('budget', 'mid-range')}
- Travel style: {prefs.get('travel_style', 'mixed')}
- Interests: {prefs.get('interests', 'general sightseeing')}
- Special requirements: {prefs.get('special_requirements', 'none')}"""


def run_phase(bedrock_client, phase, prefs, previous_results, on_event=None):
    """
    Run a single research phase with agentic tool-use loop.

    on_event callback signature: on_event(event_type: str, data: dict)
    Event types: "search", "error"
    When on_event is None (CLI mode), events are silently ignored.
    Returns (markdown_text, search_count).
    """
    context = build_context(prefs)
    phase_max_tokens = get_phase_max_tokens(phase["id"], prefs["days"])

    prev_summary = ""
    if previous_results:
        prev_summary = "\n\n## Previous Research (use this context):\n"
        for pid, result in previous_results.items():
            prev_summary += f"\n### {pid}:\n{result[:2000]}...\n"

    user_msg = f"""{context}
{prev_summary}
Now complete your research. Use the web_search tool multiple times to find real,
current information. Search for specific airlines, hotels, rental companies, etc.
Provide detailed results with actual links and prices."""

    messages = [{"role": "user", "content": [{"text": user_msg}]}]
    tools = [get_web_search_tool()]
    search_count = 0
    max_iterations = 5
    max_searches = 10

    def emit(event_type, data):
        if on_event:
            on_event(event_type, data)

    for iteration in range(max_iterations):
        try:
            response = call_bedrock_converse(
                bedrock_client, phase["system"], messages, tools=tools, max_tokens=phase_max_tokens
            )
        except Exception as e:
            emit("error", {"message": str(e)})
            return f"*Error: {e}*", search_count

        assistant_content = build_assistant_message(response)
        tool_uses = get_tool_uses(response)

        if tool_uses and search_count < max_searches:
            messages.append({"role": "assistant", "content": assistant_content})

            tool_results = []
            for tool_use in tool_uses:
                tool_name = tool_use["name"]
                tool_id = tool_use["toolUseId"]
                tool_input = tool_use.get("input", {})

                if tool_name == "web_search":
                    query = tool_input.get("query", "")
                    search_count += 1
                    emit("search", {"query": query, "count": search_count})

                    search_result = execute_web_search(query)
                    tool_results.append({
                        "toolResult": {
                            "toolUseId": tool_id,
                            "content": [{"text": search_result}],
                        }
                    })

            messages.append({"role": "user", "content": tool_results})

        else:
            if tool_uses and search_count >= max_searches:
                messages.append({"role": "assistant", "content": assistant_content})
                tool_results = []
                for tool_use in tool_uses:
                    tool_results.append({
                        "toolResult": {
                            "toolUseId": tool_use["toolUseId"],
                            "content": [{"text": "Search limit reached. Please compile your final response using the information gathered so far."}],
                            "status": "error",
                        }
                    })
                messages.append({"role": "user", "content": tool_results})

                try:
                    response = call_bedrock_converse(
                        bedrock_client, phase["system"], messages, tools=tools, max_tokens=phase_max_tokens
                    )
                except Exception as e:
                    emit("error", {"message": str(e)})
                    return f"*Error: {e}*", search_count
            break

    final_text = extract_text_from_response(response)
    return final_text, search_count
