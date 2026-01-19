import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "journal.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            raw_text TEXT NOT NULL,
            growth_note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS growth_areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()


def create_entry(raw_text: str, growth_note: dict) -> int:
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO entries (raw_text, growth_note) VALUES (?, ?)",
        (raw_text, json.dumps(growth_note))
    )
    conn.commit()
    entry_id = cursor.lastrowid
    conn.close()
    return entry_id


def get_entry(entry_id: int) -> dict | None:
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM entries WHERE id = ?", (entry_id,)
    ).fetchone()
    conn.close()

    if row:
        return {
            "id": row["id"],
            "raw_text": row["raw_text"],
            "growth_note": json.loads(row["growth_note"]) if row["growth_note"] else None,
            "created_at": row["created_at"]
        }
    return None


def get_entries(limit: int = 10, offset: int = 0) -> list[dict]:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM entries ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (limit, offset)
    ).fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "raw_text": row["raw_text"],
            "growth_note": json.loads(row["growth_note"]) if row["growth_note"] else None,
            "created_at": row["created_at"]
        }
        for row in rows
    ]


def get_growth_areas() -> list[dict]:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM growth_areas WHERE is_active = 1"
    ).fetchall()
    conn.close()

    return [dict(row) for row in rows]


def add_growth_area(name: str, description: str = "") -> int:
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO growth_areas (name, description) VALUES (?, ?)",
        (name, description)
    )
    conn.commit()
    area_id = cursor.lastrowid
    conn.close()
    return area_id


def update_growth_area(area_id: int, name: str = None, description: str = None, is_active: bool = None) -> bool:
    conn = get_db()
    updates = []
    values = []

    if name is not None:
        updates.append("name = ?")
        values.append(name)
    if description is not None:
        updates.append("description = ?")
        values.append(description)
    if is_active is not None:
        updates.append("is_active = ?")
        values.append(is_active)

    if not updates:
        return False

    values.append(area_id)
    conn.execute(f"UPDATE growth_areas SET {', '.join(updates)} WHERE id = ?", values)
    conn.commit()
    conn.close()
    return True


def delete_growth_area(area_id: int) -> bool:
    conn = get_db()
    cursor = conn.execute("DELETE FROM growth_areas WHERE id = ?", (area_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


def get_entries_count() -> int:
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) FROM entries").fetchone()[0]
    conn.close()
    return count


def get_growth_timeline(area_name: str) -> list[dict]:
    """Get all entries mentioning a specific growth area."""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM entries ORDER BY created_at ASC"
    ).fetchall()
    conn.close()

    timeline = []
    for row in rows:
        growth_note = json.loads(row["growth_note"]) if row["growth_note"] else {}
        detected_areas = growth_note.get("detectedAreas", [])

        for area in detected_areas:
            if area.get("areaName", "").lower() == area_name.lower():
                timeline.append({
                    "date": row["created_at"],
                    "entryId": row["id"],
                    "evidence": area.get("evidenceSnippet", ""),
                    "progress": area.get("progressIndicator", ""),
                    "sentiment": growth_note.get("overallSentiment", "neutral")
                })
                break

    return timeline


def get_growth_summary() -> list[dict]:
    """Get aggregate stats for all growth areas across entries."""
    conn = get_db()
    rows = conn.execute("SELECT * FROM entries").fetchall()
    conn.close()

    # Aggregate stats by area name
    area_stats = {}

    for row in rows:
        growth_note = json.loads(row["growth_note"]) if row["growth_note"] else {}
        detected_areas = growth_note.get("detectedAreas", [])

        for area in detected_areas:
            area_name = area.get("areaName", "Unknown")
            progress = area.get("progressIndicator", "")

            if area_name not in area_stats:
                area_stats[area_name] = {
                    "areaName": area_name,
                    "totalMentions": 0,
                    "improvingCount": 0,
                    "steadyCount": 0,
                    "strugglingCount": 0,
                    "lastMention": None
                }

            area_stats[area_name]["totalMentions"] += 1
            area_stats[area_name]["lastMention"] = row["created_at"]

            if progress == "improving":
                area_stats[area_name]["improvingCount"] += 1
            elif progress == "steady":
                area_stats[area_name]["steadyCount"] += 1
            elif progress == "struggling":
                area_stats[area_name]["strugglingCount"] += 1

    # Sort by total mentions descending
    return sorted(area_stats.values(), key=lambda x: x["totalMentions"], reverse=True)
