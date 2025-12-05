from typing import List, Mapping, Any
import time
import logging

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

TOPIC_DEFS = [
    ("news", "news websites, online media, journalism, articles, breaking news, current events, CNN, BBC, New York Times"),
    ("shopping", "online stores, marketplaces, product pages, price comparison, checkout, e-commerce, Amazon, eBay, AliExpress"),
    ("social", "social networks, chats, messaging apps, feeds, forums, communities, user profiles, Facebook, Instagram, X, Reddit"),
    ("video", "video platforms, streaming services, online videos, clips, movies, tv shows, live streams, YouTube, Netflix, Twitch"),
    ("education", "universities, online courses, lectures, tutorials, learning platforms, documentation, Coursera, Khan Academy, edX, Wikipedia"),
    ("work", "email, calendars, office tools, collaboration, project management, productivity apps, dashboards, Gmail, Google Drive, Slack, Notion, Trello"),
    ("finance", "online banking, brokers, trading platforms, crypto exchanges, budgeting, personal finance, PayPal, Revolut, Robinhood, Binance, Coinbase"),
    ("travel", "flights, airlines, trains, hotels, maps, trip planning, tourism, tickets, bookings, Booking.com, Airbnb, Skyscanner, Google Maps"),
    ("gaming", "video games, game platforms, launchers, esports, game guides, mods, gaming forums, Steam, Epic Games Store, PlayStation Network, Xbox Live"),
    ("entertainment", "music, fandoms, memes, comics, hobbies, pop culture, leisure, Spotify, Disney+, TikTok, IMDb"),
    ("tech", "programming, developer docs, APIs, code hosting, IT infrastructure, cloud, dev tools, GitHub, Stack Overflow, Hacker News, AWS Console"),
    ("services", "online tools, SaaS dashboards, generators, converters, cloud services, utilities, web apps, Zoom, Dropbox, Canva, Google Forms"),
    ("health", "medicine, symptoms, treatments, doctors, pharmacies, fitness, nutrition, wellbeing, WebMD, Healthline, Mayo Clinic"),
    ("government", "government portals, public services, taxes, regulations, official documents, municipal sites, usa.gov, gov.uk, irs.gov, state.gov"),
    ("other", "miscellaneous, mixed content, uncategorized, pages that do not clearly match other topics"),
]

topic_labels = [t[0] for t in TOPIC_DEFS]
topic_texts = [t[1] for t in TOPIC_DEFS]

MODEL_NAME = "all-MiniLM-L6-v2"
TEMPERATURE = 0.3

_model: SentenceTransformer | None = None
_topic_embeddings: np.ndarray | None = None


def _build_row_text(df: pd.DataFrame, explicit_cols=None) -> pd.Series:
    if explicit_cols:
        cols = [c for c in explicit_cols if c in df.columns]
    else:
        cols = [c for c in ["title", "host", "url"] if c in df.columns]
    if not cols:
        raise ValueError("No suitable text columns found. Expected at least one of: title, host, url.")
    parts = []
    for c in cols:
        parts.append(df[c].fillna("").astype(str))
    text = parts[0]
    for p in parts[1:]:
        text = text + " " + p
    return text.str.strip()


def _compute_probs(embeddings: np.ndarray, topic_embeddings: np.ndarray, temperature: float = 0.3):
    a = normalize(embeddings)
    b = normalize(topic_embeddings)
    sims = a @ b.T
    logits = sims / temperature
    logits = logits - logits.max(axis=1, keepdims=True)
    exp_logits = np.exp(logits)
    probs = exp_logits / exp_logits.sum(axis=1, keepdims=True)
    return sims, probs


def load_model_if_needed() -> None:
    global _model, _topic_embeddings
    if _model is None:
        t0 = time.perf_counter()
        logger.info("Loading SentenceTransformer model '%s'...", MODEL_NAME)
        _model = SentenceTransformer(MODEL_NAME)
        _topic_embeddings = _model.encode(topic_texts, convert_to_numpy=True)
        t1 = time.perf_counter()
        logger.info(
            "Model '%s' loaded, encoded %d topic texts in %.3f s",
            MODEL_NAME,
            len(topic_texts),
            t1 - t0,
            )


def classify_history_rows(rows: List[Mapping[str, Any]]) -> List[dict]:
    if not rows:
        logger.info("classify_history_rows called with 0 rows – nothing to do.")
        return []

    t_total_start = time.perf_counter()
    logger.info("classify_history_rows: received %d rows", len(rows))

    load_model_if_needed()

    t0 = time.perf_counter()
    df = pd.DataFrame(rows)

    if "host" not in df.columns:
        raise ValueError("Input must contain 'host' field.")

    df["_row_text"] = _build_row_text(df)

    host_text_series = df.groupby("host")["_row_text"].apply(lambda s: " ".join(s.unique()))
    host_list = host_text_series.index.tolist()
    host_texts = host_text_series.values

    logger.info(
        "classify_history_rows: %d unique hosts aggregated from %d rows",
        len(host_list),
        len(df),
    )

    t_encode_start = time.perf_counter()
    host_embeddings = _model.encode(host_texts, convert_to_numpy=True, show_progress_bar=False)
    t_encode_end = time.perf_counter()
    logger.info(
        "classify_history_rows: encoded %d host texts in %.3f s",
        len(host_list),
        t_encode_end - t_encode_start,
        )

    t_probs_start = time.perf_counter()
    sims_host, probs_host = _compute_probs(host_embeddings, _topic_embeddings, temperature=TEMPERATURE)
    t_probs_end = time.perf_counter()
    logger.info(
        "classify_history_rows: computed topic probabilities in %.3f s",
        t_probs_end - t_probs_start,
        )

    max_idx = probs_host.argmax(axis=1)
    max_prob = probs_host.max(axis=1)
    host_pred_labels = [topic_labels[i] for i in max_idx]

    host_result = pd.DataFrame({"host": host_list, "pred_topic": host_pred_labels, "pred_prob": max_prob})
    for i, label in enumerate(topic_labels):
        host_result[f"prob_{label}"] = probs_host[:, i]

    result = df.drop(columns=["_row_text"]).merge(host_result, on="host", how="left")

    out: List[dict] = []
    for _, row in result.iterrows():
        d = {
            "title": row.get("title"),
            "url": row.get("url"),
            "time_usec": int(row["time_usec"]) if pd.notna(row.get("time_usec")) else None,
            "host": row["host"],
            "pred_topic": row["pred_topic"],
            "pred_prob": float(row["pred_prob"]),
        }
        for label in topic_labels:
            d[f"prob_{label}"] = float(row[f"prob_{label}"])
        out.append(d)

    t_total_end = time.perf_counter()
    logger.info(
        "classify_history_rows: finished %d rows (%d hosts) in %.3f s",
        len(out),
        len(host_list),
        t_total_end - t_total_start,
        )

    return out