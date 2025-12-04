import sqlite3
from urllib.parse import urlparse
import os
import tempfile
import sqlite3

def read_history_db(raw_bytes: bytes) -> list[dict]:

    if not raw_bytes:
        return []

    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "history.db")
        with open(db_path, "wb") as f:
            f.write(raw_bytes)

        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
        except sqlite3.Error:
            return []

        cur = conn.cursor()

        try:
            cur.execute(
                """
                SELECT v.title,
                       v.visit_time,
                       i.url
                FROM history_visits v
                JOIN history_items i ON v.history_item = i.id
                """
            )
        except sqlite3.Error:
            conn.close()
            return []

        rows: list[dict] = []
        for r in cur.fetchall():
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