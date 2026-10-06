import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta, timezone

FIRST_NAMES = [
    "Aisha", "Liam", "Sophia", "Marcus", "Elena", "Devon", "Hannah", "Tariq",
    "Jessica", "Carlos", "Amara", "David", "Emily", "Vikram", "Olivia", "Noah",
    "Chloe", "Ethan", "Maya", "Gabriel", "Zoe", "James", "Fatima", "Lucas",
    "Nadia", "Benjamin", "Kevin", "Samantha", "Omar", "Rachel", "Tyler", "Mei-Ling",
    "Jackson", "Robert", "Amanda", "Derek", "Laura", "Victor", "Kavita", "Sean",
    "Ananya", "Mateo", "Freja", "Kenji", "Priya", "Lucas", "Siddharth", "Zahra"
]

LAST_NAMES = [
    "Patel", "Chen", "Rodriguez", "Vance", "Rostova", "Kwame", "Abbott", "Al-Mansoor",
    "Taylor", "Mendez", "Okafor", "Kim", "Watson", "Joshi", "Brown", "Gallagher",
    "Dubois", "Wright", "Lin", "Silva", "Kravitz", "O’Connor", "Al-Hassan", "Sato",
    "Petrov", "Scott", "Reed", "Farooq", "Adams", "Johnson", "Zhou", "Miller",
    "Martinez", "Jenkins", "Schmidt", "Murphy", "Deshmukh", "Tanaka", "Kowalski", "Dumont"
]

UNIVERSITIES = [
    "university.edu", "techinst.edu", "learning.org", "campus.edu", "global-edu.com",
    "academy.net", "state.edu", "polytech.edu", "online-learn.org", "metro.edu",
    "community.edu", "open-univ.edu", "eu-tech.org"
]

COURSE_MODULES = [
    "Module 1: Introduction to Data Science & Analytics",
    "Module 2: Machine Learning Fundamentals",
    "Module 3: Neural Networks & Deep Learning",
    "Module 4: Model Evaluation & Performance Metrics",
    "Module 5: Capstone Project Preparation & Deployment"
]

def generate_lms_dataset(n_total: int = 2847, seed: int = 42):
    """
    Generates synthetic LMS dataset for 2,847 learners across 4 latent behavior cohorts:
    - Target Active: ~812
    - Target Consistent: ~1104
    - Target At-Risk: ~412
    - Target Inactive: ~519
    Total: 2847
    """
    np.random.seed(seed)
    random.seed(seed)

    target_counts = {
        "active": 812,
        "consistent": 1104,
        "at-risk": 412,
        "inactive": 519,
    }

    students = []
    now = datetime.now(timezone.utc)

    id_counter = 1000

    for cohort_type, count in target_counts.items():
        for _ in range(count):
            id_counter += 1
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            domain = random.choice(UNIVERSITIES)
            name = f"{first} {last}"
            email = f"{first.lower()}.{last.lower().replace('’', '')}@{domain}"
            student_id = f"STU-{id_counter}"

            if cohort_type == "active":
                logins_per_week = int(np.clip(np.random.normal(6.3, 0.6), 5, 7))
                avg_session_mins = float(np.clip(np.random.normal(49.0, 5.0), 38, 65))
                days_since_last_login = float(np.clip(np.random.exponential(0.5), 0, 2))
                completion_pct = float(np.clip(np.random.normal(93.5, 3.5), 85, 100))
                video_watch_pct = float(np.clip(np.random.normal(95.0, 3.0), 85, 100))
                assignments_submitted_ratio = float(np.clip(np.random.normal(0.97, 0.03), 0.88, 1.0))
                quiz_attempts = int(np.clip(np.random.normal(13.0, 2.5), 8, 20))
                forum_posts = int(np.clip(np.random.poisson(11.0), 4, 30))

            elif cohort_type == "consistent":
                logins_per_week = int(np.clip(np.random.normal(3.9, 0.6), 3, 5))
                avg_session_mins = float(np.clip(np.random.normal(32.5, 4.0), 24, 42))
                days_since_last_login = float(np.clip(np.random.normal(1.3, 0.7), 0, 3))
                completion_pct = float(np.clip(np.random.normal(77.0, 4.5), 66, 86))
                video_watch_pct = float(np.clip(np.random.normal(78.0, 5.0), 65, 88))
                assignments_submitted_ratio = float(np.clip(np.random.normal(0.81, 0.05), 0.70, 0.92))
                quiz_attempts = int(np.clip(np.random.normal(6.5, 1.8), 4, 10))
                forum_posts = int(np.clip(np.random.poisson(3.2), 1, 8))

            elif cohort_type == "at-risk":
                logins_per_week = int(np.clip(np.random.normal(1.8, 0.5), 1, 2))
                avg_session_mins = float(np.clip(np.random.normal(17.5, 3.0), 10, 25))
                days_since_last_login = float(np.clip(np.random.normal(5.2, 1.2), 3, 8))
                completion_pct = float(np.clip(np.random.normal(45.0, 5.0), 32, 56))
                video_watch_pct = float(np.clip(np.random.normal(42.0, 6.0), 28, 55))
                assignments_submitted_ratio = float(np.clip(np.random.normal(0.46, 0.07), 0.30, 0.60))
                quiz_attempts = int(np.clip(np.random.normal(3.0, 1.0), 1, 5))
                forum_posts = int(np.clip(np.random.poisson(0.6), 0, 3))

            else:  # inactive
                logins_per_week = int(np.clip(np.random.normal(0.3, 0.4), 0, 1))
                avg_session_mins = float(np.clip(np.random.normal(6.0, 2.0), 2, 12))
                days_since_last_login = float(np.clip(np.random.normal(19.0, 4.0), 12, 35))
                completion_pct = float(np.clip(np.random.normal(21.0, 4.0), 8, 30))
                video_watch_pct = float(np.clip(np.random.normal(16.0, 4.0), 5, 28))
                assignments_submitted_ratio = float(np.clip(np.random.normal(0.18, 0.05), 0.05, 0.30))
                quiz_attempts = int(np.clip(np.random.normal(1.1, 0.5), 0, 2))
                forum_posts = int(np.clip(np.random.poisson(0.1), 0, 1))

            last_login_dt = now - timedelta(days=days_since_last_login)
            last_login_iso = last_login_dt.isoformat()

            students.append({
                "id": student_id,
                "name": name,
                "email": email,
                "last_login": last_login_iso,
                "logins_per_week": logins_per_week,
                "avg_session_mins": round(avg_session_mins, 1),
                "days_since_last_login": round(days_since_last_login, 1),
                "completion_pct": round(completion_pct, 1),
                "video_watch_pct": round(video_watch_pct, 1),
                "assignments_submitted_ratio": round(assignments_submitted_ratio, 2),
                "quiz_attempts": quiz_attempts,
                "forum_posts": forum_posts,
                "latent_cohort": cohort_type
            })

    df = pd.DataFrame(students)

    # Generate ~20,000 activity logs
    logs = []
    event_types = ["login", "video_watch", "quiz_submit", "assignment_submit", "forum_post"]
    log_counter = 10000

    sample_students = df.to_dict("records")
    for _ in range(20000):
        log_counter += 1
        stu = random.choice(sample_students)
        event = random.choice(event_types)
        course_module = random.choice(COURSE_MODULES)
        hours_ago = random.randint(1, 336)
        log_dt = now - timedelta(hours=hours_ago)

        logs.append({
            "id": f"LOG-{log_counter}",
            "timestamp": log_dt.isoformat(),
            "student_id": stu["id"],
            "student_name": stu["name"],
            "student_email": stu["email"],
            "latent_cohort": stu["latent_cohort"],
            "event_type": event,
            "course_module": course_module,
            "duration_mins": random.randint(5, 50),
        })

    logs_df = pd.DataFrame(logs)
    return df, logs_df
