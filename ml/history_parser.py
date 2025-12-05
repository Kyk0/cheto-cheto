import os
import tempfile
import sqlite3
import random
import json
import zipfile
from urllib.parse import urlparse

SAMPLE_FRACTION = 0.04


def _rows_from_sqlite(raw_bytes: bytes) -> list[dict]:
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "history.db")
        with open(db_path, "wb") as f:
            f.write(raw_bytes)

        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
        except sqlite3.Error as e:
            raise ValueError("Unsupported history file: invalid SQLite database") from e

        try:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT v.title,
                       v.visit_time,
                       i.url
                FROM history_visits v
                         JOIN history_items i ON v.history_item = i.id
                """
            )
        except sqlite3.Error as e:
            conn.close()
            raise ValueError("Unsupported history file: SQLite schema not recognized") from e

        rows: list[dict] = []

        for r in cur.fetchall():
            if SAMPLE_FRACTION < 1.0 and random.random() > SAMPLE_FRACTION:
                continue

            url = r["url"]
            if not url:
                continue

            host = urlparse(url).hostname
            if not host:
                continue

            try:
                time_usec = int(float(r["visit_time"]))
            except (TypeError, ValueError):
                continue

            rows.append(
                {
                    "title": r["title"],
                    "url": url,
                    "time_usec": time_usec,
                    "host": host,
                }
            )

        conn.close()

        return rows


def _rows_from_zip(raw_bytes: bytes) -> list[dict]:
    SAMPLE_FRACTION = 1
    with tempfile.TemporaryDirectory() as tmpdir:
        zip_path = os.path.join(tmpdir, "history.zip")
        with open(zip_path, "wb") as f:
            f.write(raw_bytes)

        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                history_json_name = None
                for name in zf.namelist():
                    lower = name.lower()
                    if lower.endswith("history.json"):
                        history_json_name = name
                        break

                if not history_json_name:
                    raise ValueError(
                        "Unsupported history ZIP: History.json not found"
                    )

                with zf.open(history_json_name) as jf:
                    try:
                        data = json.load(jf)
                    except json.JSONDecodeError as e:
                        raise ValueError(
                            "Unsupported history ZIP: invalid History.json"
                        ) from e
        except zipfile.BadZipFile as e:
            raise ValueError("Unsupported history file: invalid ZIP archive") from e

    entries = data.get("Browser History")
    if not isinstance(entries, list):
        raise ValueError(
            "Unsupported history ZIP: 'Browser History' list not found in History.json"
        )

    rows: list[dict] = []

    for item in entries:
        if SAMPLE_FRACTION < 1.0 and random.random() > SAMPLE_FRACTION:
            continue

        url = item.get("url")
        if not url:
            continue

        host = urlparse(url).hostname
        if not host:
            continue

        time_usec = item.get("time_usec")
        if time_usec is None:
            continue

        try:
            time_usec = int(float(time_usec))
        except (TypeError, ValueError):
            continue

        title = item.get("title") or ""

        rows.append(
            {
                "title": title,
                "url": url,
                "time_usec": time_usec,
                "host": host,
            }
        )

    return rows


def read_history_db(raw_bytes: bytes) -> list[dict]:
    if not raw_bytes:
        raise ValueError("Empty history file")

    header = raw_bytes[:16]

    # SQLite signature
    if header.startswith(b"SQLite format 3"):
        return _rows_from_sqlite(raw_bytes)

    # ZIP signature
    if header[:2] == b"PK":
        return _rows_from_zip(raw_bytes)

    raise ValueError(
        "Unsupported history file type: expected Chrome History SQLite DB or ZIP with History.json"
    )