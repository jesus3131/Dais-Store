from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from analysis import analyze

app = FastAPI(title="Dais Store - Report Analysis Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/analyze/{report_type}")
def get_analysis(
    report_type: str,
    period: str = Query("monthly"),
    from_date: str = Query(None),
    to_date: str = Query(None),
    limit: int = Query(10),
):
    return analyze(report_type, period, from_date, to_date, limit)

@app.get("/health")
def health():
    return {"status": "ok"}
