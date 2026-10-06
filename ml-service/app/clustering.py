import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score

FEATURE_NAMES = [
    "logins_per_week",
    "avg_session_mins",
    "days_since_last_login",
    "completion_pct",
    "video_watch_pct",
    "assignments_submitted_ratio",
    "quiz_attempts",
    "forum_posts",
]

FEATURE_LABELS = {
    "logins_per_week": "Weekly Logins",
    "avg_session_mins": "Avg Session Duration",
    "days_since_last_login": "Days Inactive",
    "completion_pct": "Course Completion %",
    "video_watch_pct": "Video Watch Rate %",
    "assignments_submitted_ratio": "Assignment Rate",
    "quiz_attempts": "Quiz Mastery Attempts",
    "forum_posts": "Forum Discussion Posts",
}

COHORT_LABELS_4 = {
    "active": "Active",
    "consistent": "Consistent",
    "at-risk": "At-Risk",
    "inactive": "Inactive",
}

COHORT_DESCRIPTIONS_4 = {
    "active": "Highly engaged learners finishing content ahead of schedule.",
    "consistent": "Steady learners with predictable weekly study rhythm.",
    "at-risk": "Irregular activity and falling behind the course pace.",
    "inactive": "Critical drop-off with almost no recent LMS activity.",
}

COHORT_SIGNALS_4 = {
    "active": "Logs in 6+ days/week",
    "consistent": "Logs in 3-4 days/week",
    "at-risk": "Logs in 1-2 days/week",
    "inactive": "No login in 14+ days",
}

SUGGESTED_ACTIONS_4 = {
    "active": "Nominate for Peer Mentor / Teaching Assistant role in advanced modules.",
    "consistent": "Encourage joining student study groups and provide milestone progress badge.",
    "at-risk": "Send a nudge email and offer a study-plan check-in.",
    "inactive": "Initiate re-engagement survey or academic advisor outreach.",
}

class LMSClusteringEngine:
    def __init__(self, df: pd.DataFrame, logs_df: pd.DataFrame):
        self.raw_df = df.copy()
        self.logs_df = logs_df.copy()
        self.k = 4
        self.selected_features = list(FEATURE_NAMES)

        self.scaler = StandardScaler()
        self.kmeans = None
        self.cluster_mapping: Dict[int, str] = {}
        self.processed_df: pd.DataFrame = pd.DataFrame()
        self.quality_metrics: Dict[str, Any] = {}
        self.elbow_curve: List[Dict[str, Any]] = []

        # Train initial model
        self.fit(k=4, features=self.selected_features)

    def _transform_features(self, df: pd.DataFrame, features: List[str]) -> np.ndarray:
        data = df[features].copy()
        skewed = ["logins_per_week", "quiz_attempts", "forum_posts"]
        for col in skewed:
            if col in data.columns:
                data[col] = np.log1p(np.maximum(0, data[col]))
        return data.values

    def fit(self, k: int = 4, features: List[str] = None):
        if features is None:
            features = list(FEATURE_NAMES)
        self.k = k
        self.selected_features = features

        X = self._transform_features(self.raw_df, features)
        X_scaled = self.scaler.fit_transform(X)

        self.kmeans = KMeans(n_clusters=k, n_init=20, random_state=42)
        cluster_labels = self.kmeans.fit_predict(X_scaled)

        centroids = self.kmeans.cluster_centers_

        # Map cluster labels deterministically by engagement score
        scores = []
        for i, c in enumerate(centroids):
            # c is scaled feature vector
            # higher completion, logins, video, assignment = higher score; higher days_since_last_login = lower score
            score = 0.0
            for feat_idx, feat_name in enumerate(features):
                val = c[feat_idx]
                if feat_name == "days_since_last_login":
                    score -= val * 1.5
                else:
                    score += val
            scores.append((score, i))

        scores.sort(key=lambda x: x[0], reverse=True)

        self.cluster_mapping = {}
        if k == 4:
            names = ["active", "consistent", "at-risk", "inactive"]
            for rank, (score, orig_idx) in enumerate(scores):
                self.cluster_mapping[orig_idx] = names[rank]
        else:
            for rank, (score, orig_idx) in enumerate(scores):
                self.cluster_mapping[orig_idx] = f"group-{rank+1}"

        mapped_cohorts = [self.cluster_mapping[c] for c in cluster_labels]

        df_out = self.raw_df.copy()
        df_out["cohort"] = mapped_cohorts
        df_out["cluster_idx"] = cluster_labels

        # Compute z-scores for feature explanations
        z_scores = (X - X.mean(axis=0)) / (X.std(axis=0) + 1e-6)
        df_out["z_scores"] = list(z_scores)

        self.processed_df = df_out

        # Compute model quality metrics
        if len(np.unique(cluster_labels)) > 1:
            sil = float(silhouette_score(X_scaled, cluster_labels))
            db = float(davies_bouldin_score(X_scaled, cluster_labels))
        else:
            sil = 0.0
            db = 0.0

        inertia = float(self.kmeans.inertia_)

        # Compute Elbow curve k=2..8
        elbow = []
        for test_k in range(2, 9):
            km_test = KMeans(n_clusters=test_k, n_init=10, random_state=42)
            lbls_test = km_test.fit_predict(X_scaled)
            sil_test = float(silhouette_score(X_scaled, lbls_test))
            elbow.append({
                "k": test_k,
                "inertia": round(float(km_test.inertia_), 1),
                "silhouetteScore": round(sil_test, 3)
            })

        self.quality_metrics = {
            "k": k,
            "silhouetteScore": round(sil, 3),
            "inertia": round(inertia, 1),
            "daviesBouldin": round(db, 3),
            "elbowCurve": elbow
        }

    def get_cohort_summaries(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        total_learners = len(self.processed_df)
        counts = self.processed_df["cohort"].value_counts().to_dict()

        color_map = {
            "active": "#10B981",
            "consistent": "#3B82F6",
            "at-risk": "#F59E0B",
            "inactive": "#EF4444",
        }

        cohort_list = []
        profile_list = []

        # Order cohorts deterministically
        if self.k == 4:
            order = ["active", "consistent", "at-risk", "inactive"]
        else:
            order = [f"group-{i+1}" for i in range(self.k)]

        for c_id in order:
            cnt = counts.get(c_id, 0)
            pct = round((cnt / total_learners) * 100, 1)
            c_label = COHORT_LABELS_4.get(c_id, c_id.replace("-", " ").title())
            c_color = color_map.get(c_id, "#4F46E5")

            cohort_list.append({
                "id": c_id,
                "label": c_label,
                "count": cnt,
                "percent": pct,
                "color": c_color
            })

            sub_df = self.processed_df[self.processed_df["cohort"] == c_id]
            avg_logins = round(float(sub_df["logins_per_week"].mean()), 1) if not sub_df.empty else 0.0
            avg_sess = round(float(sub_df["avg_session_mins"].mean()), 1) if not sub_df.empty else 0.0
            avg_comp = round(float(sub_df["completion_pct"].mean()), 1) if not sub_df.empty else 0.0

            centroid_means = {}
            for fn in FEATURE_NAMES:
                centroid_means[fn] = round(float(sub_df[fn].mean()), 2) if not sub_df.empty else 0.0

            desc = COHORT_DESCRIPTIONS_4.get(c_id, f"Learners assigned to cluster {c_id}.")
            sig = COHORT_SIGNALS_4.get(c_id, f"Avg logins: {avg_logins} days/week")

            profile_list.append({
                "id": c_id,
                "description": desc,
                "avgWeeklyActiveDays": avg_logins,
                "avgSessionMins": avg_sess,
                "avgCompletionPct": avg_comp,
                "signal": sig,
                "centroid": centroid_means
            })

        return cohort_list, profile_list

    def get_student_explanation(self, row: pd.Series) -> Dict[str, Any]:
        c_id = row["cohort"]
        z_arr = row["z_scores"]

        devs = []
        for i, fn in enumerate(self.selected_features):
            z_val = z_arr[i]
            val = row[fn]
            mean_val = float(self.raw_df[fn].mean())
            devs.append({
                "feature": fn,
                "featureLabel": FEATURE_LABELS.get(fn, fn),
                "abs_z": abs(z_val),
                "z_val": z_val,
                "studentValue": round(val, 1) if isinstance(val, float) else val,
                "datasetMean": round(mean_val, 1) if isinstance(mean_val, float) else round(mean_val, 2),
                "direction": "higher" if z_val >= 0 else "lower"
            })

        devs.sort(key=lambda x: x["abs_z"], reverse=True)
        top3 = devs[:3]

        # Generate summary
        top_str = ", ".join([f"{f['featureLabel']} ({f['studentValue']} vs avg {f['datasetMean']})" for f in top3])
        c_name = COHORT_LABELS_4.get(c_id, c_id.title())
        summary = f"Student exhibits key metric deviations in {top_str}, placing them in the {c_name} cohort."
        suggested = SUGGESTED_ACTIONS_4.get(c_id, "Monitor learning progress and provide feedback.")

        return {
            "topFeatures": top3,
            "summary": summary,
            "suggestedAction": suggested
        }

    def get_students(
        self,
        cohort: str = None,
        q: str = None,
        sort: str = "name",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10
    ) -> Tuple[List[Dict[str, Any]], int, int]:
        df = self.processed_df.copy()

        if cohort:
            df = df[df["cohort"] == cohort]

        if q:
            q_lower = q.lower()
            df = df[
                df["name"].str.lower().str.contains(q_lower) |
                df["email"].str.lower().str.contains(q_lower) |
                df["id"].str.lower().str.contains(q_lower)
            ]

        # Sorting
        sort_col_map = {
            "name": "name",
            "lastLogin": "last_login",
            "completionPct": "completion_pct",
            "weeklyLogins": "logins_per_week",
            "avgSessionMins": "avg_session_mins",
            "cohort": "cohort"
        }
        col = sort_col_map.get(sort, "name")
        ascending = (order == "asc")
        if col in df.columns:
            df = df.sort_values(by=col, ascending=ascending)

        total = len(df)
        total_pages = max(1, int(np.ceil(total / page_size)))
        start = (page - 1) * page_size
        end = start + page_size

        sliced = df.iloc[start:end]
        students_out = []

        for _, row in sliced.iterrows():
            explanation = self.get_student_explanation(row)
            students_out.append({
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
            })

        return students_out, total, total_pages
