.PHONY: install train evaluate test lint backend frontend

install:
	cd backend && python -m pip install -r requirements-dev.lock
	cd frontend && npm install

train:           ## build backend/artifacts/model_bundle.joblib from data/dataset.json
	cd backend && python -m ml.train

evaluate:        ## random vs held-out-country vs temporal evaluation -> docs/evaluation_results.json
	cd backend && python -m ml.evaluate

test:
	cd backend && python -m pytest -q

lint:
	cd backend && ruff check .

backend:         ## http://127.0.0.1:8000/docs
	cd backend && python -m uvicorn app.main:app --reload

frontend:        ## http://localhost:5175
	cd frontend && npm run dev
