"""Web search tool definition and execution."""

import os


def get_web_search_tool():
    """Define web search tool for Bedrock Converse API."""
    return {
        "toolSpec": {
            "name": "web_search",
            "description": (
                "Search the web for current, real-time information. "
                "Use this to find flights, hotels, prices, reviews, "
                "rental services, local rules, attractions, and any "
                "travel-related information. Returns relevant web results."
            ),
            "inputSchema": {
                "json": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query to look up on the web.",
                        }
                    },
                    "required": ["query"],
                }
            },
        }
    }


def execute_web_search(query):
    """
    Execute web search.
    Default: Returns acknowledgment so the model uses its training knowledge.
    Replace with a real search API (Tavily, SerpAPI, Google, Bing) for live results.
    """
    return (
        f"Web search executed for: '{query}'. "
        f"Please provide the most detailed, current, and accurate information "
        f"you have about this topic, including specific names, prices, URLs, "
        f"ratings, and addresses where applicable."
    )
