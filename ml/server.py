from typing import List, Optional

from fastapi import UploadFile, File, HTTPException, FastAPI
from pydantic import BaseModel

from ml_logic import classify_history_rows
from history_parser import read_history_db

app = FastAPI()


class MlDataRequest(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    time_usec: Optional[int] = None
    host: str


class MlDataResponse(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    time_usec: Optional[int] = None
    host: str

    pred_topic: str
    pred_prob: float
    prob_news: float
    prob_shopping: float
    prob_social: float
    prob_video: float
    prob_education: float
    prob_work: float
    prob_finance: float
    prob_travel: float
    prob_gaming: float
    prob_entertainment: float
    prob_tech: float
    prob_services: float
    prob_health: float
    prob_government: float
    prob_other: float


@app.post("/predict-history", response_model=List[MlDataResponse])
def predict(items: List[MlDataRequest]):
    rows = [item.dict() for item in items]
    result_dicts = classify_history_rows(rows)
    return [MlDataResponse(**d) for d in result_dicts]

@app.post("/predict-history/safari", response_model=List[MlDataResponse])
async def predict_history_safari(file: UploadFile = File(...)):
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    history_rows = read_history_db(raw)

    if not history_rows:
        raise HTTPException(
            status_code=400,
            detail="Could not read history data from DB file"
        )

    result_dicts = classify_history_rows(history_rows)
    return [MlDataResponse(**d) for d in result_dicts]


@app.get("/health")
def health():
    return {"status": "ok"}