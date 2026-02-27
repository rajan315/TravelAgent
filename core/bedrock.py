"""AWS Bedrock client and Converse API helpers."""

import os
import boto3
from botocore.config import Config

AWS_REGION = os.environ.get("AWS_BEDROCK_REGION", "us-east-1")
MODEL_ID = "us.anthropic.claude-opus-4-6-v1"


def get_bedrock_client():
    """Create a Bedrock Runtime client."""
    return boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
        config=Config(read_timeout=180, retries={"max_attempts": 2}),
    )


def call_bedrock_converse(client, system_prompt, messages, tools=None, max_tokens=8000):
    """Call Claude via Bedrock Converse API."""
    kwargs = {
        "modelId": MODEL_ID,
        "system": [{"text": system_prompt}],
        "messages": messages,
        "inferenceConfig": {
            "maxTokens": max_tokens,
            "temperature": 0.7,
        },
    }
    if tools:
        kwargs["toolConfig"] = {"tools": tools}

    return client.converse(**kwargs)


def extract_text_from_response(response):
    """Extract all text blocks from a Bedrock Converse response."""
    texts = []
    message = response.get("output", {}).get("message", {})
    for block in message.get("content", []):
        if "text" in block:
            texts.append(block["text"])
    return "\n".join(texts)


def has_tool_use(response):
    """Check if response contains tool use blocks."""
    message = response.get("output", {}).get("message", {})
    return any("toolUse" in block for block in message.get("content", []))


def get_tool_uses(response):
    """Extract tool use blocks from response."""
    message = response.get("output", {}).get("message", {})
    return [block["toolUse"] for block in message.get("content", []) if "toolUse" in block]


def get_stop_reason(response):
    """Get the stop reason from response."""
    return response.get("stopReason", "end_turn")


def build_assistant_message(response):
    """Build assistant message content from Bedrock response for conversation history."""
    return response.get("output", {}).get("message", {}).get("content", [])
