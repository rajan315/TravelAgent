"""Q&A functionality — single-turn for API, loop for CLI."""

from core.bedrock import (
    call_bedrock_converse,
    build_assistant_message,
    extract_text_from_response,
    get_tool_uses,
)
from core.search import get_web_search_tool, execute_web_search


def create_qa_system_prompt(prefs, all_results):
    """Build the Q&A system prompt with research context."""
    full_research = "\n\n".join(
        f"## {pid.upper()}\n{text}" for pid, text in all_results.items()
    )
    return f"""You are a helpful travel assistant. You have a web_search tool.
You have detailed research about a trip to {prefs['destination']}.
Answer questions using the research AND new web searches when needed.
Always provide specific names, prices, links, and actionable info.

Previous research summary:
{full_research[:6000]}"""


def run_qa_turn(bedrock_client, system_prompt, messages, question):
    """
    Run a single Q&A turn: add the user question, run agentic loop, return answer.
    Mutates `messages` in-place (appends user + assistant messages).
    Returns the answer text.
    """
    messages.append({"role": "user", "content": [{"text": question}]})

    tools = [get_web_search_tool()]
    qa_messages = list(messages)

    for _ in range(8):
        try:
            resp = call_bedrock_converse(
                bedrock_client, system_prompt, qa_messages, tools=tools, max_tokens=4096
            )
        except Exception as e:
            answer = f"Error: {e}"
            messages.append({"role": "assistant", "content": [{"text": answer}]})
            return answer

        tool_uses = get_tool_uses(resp)
        assistant_content = build_assistant_message(resp)

        if tool_uses:
            qa_messages.append({"role": "assistant", "content": assistant_content})
            tool_results = []
            for tu in tool_uses:
                query = tu.get("input", {}).get("query", "")
                result = execute_web_search(query)
                tool_results.append({
                    "toolResult": {
                        "toolUseId": tu["toolUseId"],
                        "content": [{"text": result}],
                    }
                })
            qa_messages.append({"role": "user", "content": tool_results})
        else:
            break

    answer = extract_text_from_response(resp)
    messages.append({"role": "assistant", "content": [{"text": answer}]})
    return answer
