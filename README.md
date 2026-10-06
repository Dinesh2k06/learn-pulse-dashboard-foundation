# 🎓 LearnPulse: Learning Analytics & ML Cohort Dashboard

**LearnPulse** is a light-mode analytics dashboard and Machine Learning engine that analyzes online learning behavior (LMS activity) to cluster learners into 4 distinct behavior cohorts using **K-Means Clustering** (`scikit-learn`).

![LearnPulse Dashboard](public/icon.svg)

---

## ✨ Features

- **📊 Executive Overview Dashboard**: Real-time KPI metric cards (Total Learners, Avg Weekly Active Days, Avg Course Completion, At-Risk Count).
- **📈 Dual-View Cohort Distribution Chart**: Switch seamlessly between vertical **Bar Chart** and interactive **Ring / Donut Chart** views with hover dimming and filter synchronization.
- **🏷️ Cohort Summary Panel**: Proportional distribution bar and interactive cards detailing weekly active days, average session duration, completion rate, and risk flags (`At-Risk`, `Inactive`).
- **👥 Interactive Student Behavior Table**: 
  - Real-time debounced search (250ms) across student names, emails, and IDs.
  - Cohort filter chips (`All`, `Active`, `Consistent`, `At-Risk`, `Inactive`).
  - Column sorting (asc/desc with ARIA compliance).
  - Paginated table (10 students per page).
  - CSV export for filtered datasets.
- **🔍 Student ML Detail Sheet**: Slide-over drawer displaying a student's full 8-feature profile, ML cluster assignment explanation ("Why this group?"), top feature deviation z-scores, and tailored pedagogical recommendations.
- **🧪 Student Cohorts & Live Re-clustering (`/cohorts`)**:
  - Centroid comparison grouped bar chart across all 8 features (with accessible data table toggle).
  - K-Means validation metrics (**Silhouette Score**, **Davies-Bouldin Index**, **Inertia**, and an **Elbow Curve** for $k=2..8$).
  - **Live Re-clustering Controls**: Dynamically change cluster count ($k=2..8$) and select active features to retrain the model in real time.
- **📜 Activity Logs Stream (`/activity-logs`)**: Filterable, paginated event log stream (Logins, Video Watches, Quiz Attempts, Assignments, Forum Posts) with daily activity charts.
- **⚙️ Admin Settings (`/settings`)**: Hyperparameter controls, inactivity threshold rules, notification toggles, instructor profile, and API health controls.
- **⚡ Live ML Backend & Offline Fallback**: Connects to the Python FastAPI server (`http://localhost:8000`) with automatic fallback to rich offline mock data if the API is offline.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router, Turbopack) & React 19
- **TypeScript**: Strict typing with shared domain interfaces
- **Styling**: Tailwind CSS v4 (CSS-first token configuration in `app/globals.css` with `@theme inline`)
- **Data Visualization**: Recharts 3
- **Icons**: Lucide React
- **Package Manager**: `pnpm`

### **Machine Learning Backend**
- **Framework**: Python 3.11+ & FastAPI
- **ML / Data Science**: `scikit-learn`, `pandas`, `numpy`
- **Model**: K-Means Clustering ($k=4$, `n_init=20`, reproducible seed `42`)
- **Preprocessing**: `StandardScaler` with `log1p` transformation for skewed count metrics
- **Server**: Uvicorn
- **Testing**: Pytest

---

## 🎨 Design System & Color Tokens

LearnPulse uses a light-mode color palette:

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Main BG** | `#F8FAFC` | Page background |
| **Surface BG** | `#FFFFFF` | Card & panel background |
| **Text Primary** | `#0F172A` | Headings & primary body |
| **Text Secondary** | `#64748B` | Subtitles & metadata |
| **Border Subtle** | `#E2E8F0` | Dividers & card outlines |
| **Primary (Indigo)** | `#4F46E5` | Active nav, primary buttons, rings |
| **Active Cohort** | `#10B981` | Emerald badge (`#D1FAE5` bg / `#065F46` text) |
| **Consistent Cohort** | `#3B82F6` | Blue badge (`#DBEAFE` bg / `#1E40AF` text) |
| **At-Risk Cohort** | `#F59E0B` | Amber badge (`#FEF3C7` bg / `#92400E` text) |
| **Inactive Cohort** | `#EF4444` | Red badge (`#FEE2E2` bg / `#991B1B` text) |

---

## 🧠 ML Model Architecture & Cohort Profiles

The dataset models **2,847 learners** across 8 LMS behavioral features:
1. `logins_per_week`
2. `avg_session_mins`
3. `days_since_last_login`
4. `completion_pct`
5. `video_watch_pct`
6. `assignments_submitted_ratio`
7. `quiz_attempts`
8. `forum_posts`

### Cohort Definitions:
- **Active** (~812 learners / 28.5%): 6+ logins/wk, 48m avg session, 94% completion, high forum engagement.
- **Consistent** (~1,104 learners / 38.8%): 3-4 logins/wk, 32m avg session, 78% completion, steady study rhythm.
- **At-Risk** (~412 learners / 14.5%): 1-2 logins/wk, 17m avg session, 46% completion, falling behind course pace.
- **Inactive** (~519 learners / 18.2%): <1 login/wk, 14+ days inactive, 21% completion, critical drop-off risk.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Dinesh2k06/learn-pulse-dashboard-foundation.git
cd learn-pulse-dashboard-foundation
```

### 2. Start the Python ML Backend
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*The API server will run at `http://localhost:8000`.*

### 3. Start the Next.js Frontend
In a new terminal window:
```bash
pnpm install
pnpm dev
```
*Open **`http://localhost:3000`** in your browser.*

---

## 📡 API Reference Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & connection status |
| `GET` | `/api/metrics` | Overview KPI summary stats |
| `GET` | `/api/cohorts` | Cohort distribution counts & centroid profiles |
| `GET` | `/api/students` | Filtered, sorted, paginated student list |
| `GET` | `/api/students/{id}` | Detailed student profile with ML explanation |
| `GET` | `/api/activity-logs` | Event log stream |
| `GET` | `/api/cluster/quality` | Silhouette, Davies-Bouldin, and Elbow curve data |
| `POST` | `/api/cluster/run` | Retrains K-Means with specified $k$ and feature subset |
| `GET` | `/api/export/students.csv` | Downloads CSV export |
| `GET` / `PUT` | `/api/settings` | Gets or updates application configuration |

---

## 🧪 Testing

### Frontend Build & Type Validation
```bash
pnpm build
```

### ML Backend Pytest Suite
```bash
$env:PYTHONPATH="ml-service"
python -m pytest ml-service/tests
```

---

## 📝 License

Distributed under the MIT License.
