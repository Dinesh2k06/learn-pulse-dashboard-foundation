import io
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Query, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.data_gen import generate_lms_dataset
from app.clustering import LMSClusteringEngine

app = FastAPI(title="LearnPulse ML Backend Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global dataset & engine state
print("Initializing synthetic LMS dataset (2,847 learners)...")
df_data, df_logs = generate_lms_dataset(n_total=2847, seed=42)
engine = LMSClusteringEngine(df_data, df_logs)

app_settings_state = {
    "clustering": {
        "k": 4,
        "features": {
            "logins_per_week": True,
            "avg_session_mins": True,
            "days_since_last_login": True,
            "completion_pct": True,
            "video_watch_pct": True,
            "assignments_submitted_ratio": True,
            "quiz_attempts": True,
            "forum_posts": True,
        },
        "atRiskThresholdDays": 5,
    },
    "notifications": {
        "emailDigest": True,
        "atRiskAlertThreshold": 10,
    },
    "profile": {
        "name": "Dr. Priya Nair",
        "role": "Course Administrator & Lead ML Instructor",
        "email": "p.nair@learnpulse.edu",
    },
    "modelStatus": {
        "isLive": True,
        "lastTrained": "2026-10-06T18:30:00Z",
        "apiUrl": "http://localhost:8000",
    },
}

class ClusterRunBody(BaseModel):
    k: int = Field(default=4, ge=2, le=8)
    features: Optional[List[str]] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LearnPulse ML API",
        "totalLearners": len(engine.raw_df),
        "currentK": engine.k
    }

@app.get("/api/metrics")
def get_metrics():
    total_learners = len(engine.processed_df)
    avg_active_days = round(float(engine.processed_df["logins_per_week"].mean()), 1)
    avg_completion = round(float(engine.processed_df["completion_pct"].mean()), 0)
    at_risk_count = len(engine.processed_df[engine.processed_df["cohort"] == "at-risk"])

    return [
        {
            "label": "Total Learners",
            "value": f"{total_learners:,}",
            "trend": "+4.2%",
            "trendDirection": "up",
            "icon": "users"
        },
        {
            "label": "Avg. Weekly Active Days",
            "value": str(avg_active_days),
            "trend": "+0.3 days",
            "trendDirection": "up",
            "icon": "calendar"
        },
        {
            "label": "Avg. Course Completion",
            "value": f"{int(avg_completion)}%",
            "trend": "+5.1%",
            "trendDirection": "up",
            "icon": "book"
        },
        {
            "label": "At-Risk Learners",
            "value": str(at_risk_count),
            "trend": "-2.8%",
            "trendDirection": "down",
            "trendContext": "improving",
            "icon": "alert"
        },
    ]

@app.get("/api/cohorts")
def get_cohorts():
    cohort_list, profile_list = engine.get_cohort_summaries()
    return {
        "cohorts": cohort_list,
        "profiles": profile_list
    }

@app.get("/api/students")
def get_students(
    cohort: Optional[str] = None,
    q: Optional[str] = None,
    sort: Optional[str] = "name",
    order: Optional[str] = "asc",
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=10, ge=1, le=100)
):
    items, total, total_pages = engine.get_students(
        cohort=cohort,
        q=q,
        sort=sort,
        order=order,
        page=page,
        page_size=pageSize
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@app.get("/api/students/{student_id}")
def get_student_by_id(student_id: str):
    sub = engine.processed_df[engine.processed_df["id"] == student_id]
    if sub.empty:
        raise HTTPException(status_code=404, detail="Student not found")
    row = sub.iloc[0]
    explanation = engine.get_student_explanation(row)
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "lastLogin": row["last_login"],
        "completionPct": float(row["completion_pct"]),
        "cohort": row["cohort"],
        "weeklyLogins": int(row["logins_per_week"]),
        "avgSessionMins": float(row["avg_session_mins"]),
        "daysSinceLastLogin": float(row["days_since_last_login"]),
        "videoWatchPct": float(row["video_watch_pct"]),
        "assignmentsSubmittedRatio": float(row["assignments_submitted_ratio"]),
        "quizAttempts": int(row["quiz_attempts"]),
        "forumPosts": int(row["forum_posts"]),
        "explanation": explanation
    }

@app.get("/api/activity-logs")
def get_activity_logs(
    type: Optional[str] = None,
    cohort: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=10, ge=1, le=100)
):
    logs = engine.logs_df.copy()

    # Map actual cohort from student
    student_cohort_map = dict(zip(engine.processed_df["id"], engine.processed_df["cohort"]))
    logs["cohort"] = logs["student_id"].map(student_cohort_map).fillna(logs["latent_cohort"])

    if cohort:
        logs = logs[logs["cohort"] == cohort]

    if type and type != "all":
        logs = logs[logs["event_type"] == type]

    if q:
        q_lower = q.lower()
        logs = logs[
            logs["student_name"].str.lower().str.contains(q_lower) |
            logs["student_email"].str.lower().str.contains(q_lower) |
            logs["course_module"].str.lower().str.contains(q_lower)
        ]

    total = len(logs)
    total_pages = max(1, int((total + pageSize - 1) // pageSize))
    start = (page - 1) * pageSize
    end = start + pageSize

    sliced = logs.iloc[start:end]
    items = []
    for _, r in sliced.iterrows():
        items.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "studentId": r["student_id"],
            "studentName": r["student_name"],
            "studentEmail": r["student_email"],
            "cohort": r["cohort"],
            "eventType": r["event_type"],
            "courseModule": r["course_module"],
            "durationMins": int(r["duration_mins"])
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@app.get("/api/cluster/quality")
def get_cluster_quality():
    return engine.quality_metrics

@app.post("/api/cluster/run")
def run_cluster(body: ClusterRunBody):
    k = body.k
    features = body.features if body.features else None
    engine.fit(k=k, features=features)
    cohort_list, _ = engine.get_cohort_summaries()
    return {
        "message": f"Successfully re-trained K-Means model with k={k}",
        "k": k,
        "cohorts": cohort_list,
        "quality": engine.quality_metrics
    }

@app.get("/api/export/students.csv")
def export_students_csv():
    df = engine.processed_df.copy()
    cols_to_export = [
        "id", "name", "email", "cohort", "completion_pct", "logins_per_week",
        "avg_session_mins", "days_since_last_login", "video_watch_pct",
        "assignments_submitted_ratio", "quiz_attempts", "forum_posts", "last_login"
    ]
    export_df = df[cols_to_export]
    output = io.StringIO()
    export_df.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=learnpulse_students.csv"}
    )

@app.get("/api/settings")
def get_settings():
    return app_settings_state

@app.put("/api/settings")
def update_settings(new_settings: Dict[str, Any]):
    global app_settings_state
    app_settings_state.update(new_settings)
    return {"status": "updated", "settings": app_settings_state}
