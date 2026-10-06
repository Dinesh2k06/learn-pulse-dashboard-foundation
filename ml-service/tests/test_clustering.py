import pytest
from app.data_gen import generate_lms_dataset
from app.clustering import LMSClusteringEngine

def test_data_generation_reproducibility():
    df1, _ = generate_lms_dataset(n_total=2847, seed=42)
    df2, _ = generate_lms_dataset(n_total=2847, seed=42)
    assert len(df1) == 2847
    assert len(df2) == 2847
    assert df1["name"].tolist() == df2["name"].tolist()
    assert df1["completion_pct"].tolist() == df2["completion_pct"].tolist()

def test_clustering_count_totals():
    df, logs = generate_lms_dataset(n_total=2847, seed=42)
    engine = LMSClusteringEngine(df, logs)
    cohorts, _ = engine.get_cohort_summaries()
    total_count = sum(c["count"] for c in cohorts)
    assert total_count == 2847

def test_cohort_label_mapping_order():
    df, logs = generate_lms_dataset(n_total=2847, seed=42)
    engine = LMSClusteringEngine(df, logs)
    cohorts, profiles = engine.get_cohort_summaries()
    labels = [c["id"] for c in cohorts]
    assert labels == ["active", "consistent", "at-risk", "inactive"]

    # Active should have highest avg completion
    active_profile = next(p for p in profiles if p["id"] == "active")
    inactive_profile = next(p for p in profiles if p["id"] == "inactive")
    assert active_profile["avgCompletionPct"] > inactive_profile["avgCompletionPct"]
    assert active_profile["avgWeeklyActiveDays"] > inactive_profile["avgWeeklyActiveDays"]

def test_pagination_and_filtering():
    df, logs = generate_lms_dataset(n_total=2847, seed=42)
    engine = LMSClusteringEngine(df, logs)

    items, total, pages = engine.get_students(cohort="active", page=1, page_size=10)
    assert len(items) <= 10
    assert all(s["cohort"] == "active" for s in items)
    assert total > 0

    items_q, total_q, _ = engine.get_students(q="aisha", page=1, page_size=10)
    assert all("aisha" in s["name"].lower() or "aisha" in s["email"].lower() for s in items_q)

def test_custom_k_clustering():
    df, logs = generate_lms_dataset(n_total=2847, seed=42)
    engine = LMSClusteringEngine(df, logs)
    engine.fit(k=5)
    cohorts, _ = engine.get_cohort_summaries()
    assert len(cohorts) == 5
    assert sum(c["count"] for c in cohorts) == 2847
