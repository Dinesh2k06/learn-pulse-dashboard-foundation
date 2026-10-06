# LearnPulse ML Backend Service

Python FastAPI service providing K-Means clustering analytics for LMS learner behavior.

## Requirements
- Python 3.11+
- Dependencies: `fastapi`, `uvicorn`, `scikit-learn`, `pandas`, `numpy`, `pytest`, `httpx`

## Quick Start

### 1. Install dependencies
```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Run the API Server
```bash
uvicorn app.main:app --reload --port 8000
```

The server runs at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 3. Run Tests
```bash
pytest
```
