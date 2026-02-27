"""Save research results to markdown file."""

import re
from datetime import datetime
from core.phases import PHASES


def save_full_plan(all_results, prefs):
    """Save the complete plan to markdown. Returns (filename, content)."""
    safe = re.sub(r'[^\w\s-]', '', prefs['destination']).strip().replace(' ', '_').lower()
    ts = datetime.now().strftime("%Y%m%d_%H%M")
    filename = f"trip_{safe}_{ts}.md"

    lines = []
    lines.append(f"# \U0001f30d Complete Trip Plan: {prefs['destination']}\n")
    lines.append(f"_Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')}_\n\n")
    lines.append(f"**Traveler:** {prefs.get('nationality', 'N/A')} | **From:** {prefs.get('departing_from', 'N/A')} | ")
    lines.append(f"**Dates:** {prefs.get('travel_dates', 'flexible')} | **Budget:** {prefs.get('budget', 'mid-range')}\n\n")
    lines.append("---\n\n")

    for phase in PHASES:
        if phase["id"] in all_results:
            lines.append(f"\n{all_results[phase['id']]}\n\n---\n\n")

    content = "".join(lines)
    return filename, content


def save_full_plan_to_file(all_results, prefs):
    """Save to disk (CLI usage). Returns filename."""
    filename, content = save_full_plan(all_results, prefs)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    return filename
