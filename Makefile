.PHONY: help install pipeline repro train evaluate test cov lint mlflow drift backend frontend docker

help:            ## list targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed 's/:.*##/\t/'

install:         ## dev dependencies (backend + frontend)
	cd backend && python -m pip install -r requirements-dev.lock
	cd frontend && npm install

pipeline:        ## validate -> train -> evaluate -> gate, logged to MLflow (ARGS="--set data.pollutant_repair=interpolate")
	cd backend && python -m ml.pipeline run $(ARGS)

repro:           ## same pipeline through DVC: only re-runs stages whose inputs changed (pip install dvc)
	cd backend && dvc repro && dvc metrics show

train:           ## quick path: train only, from the raw extract
	cd backend && python -m ml.train

evaluate:        ## random vs held-out-country vs temporal evaluation -> docs/evaluation_results.json
	cd backend && python -m ml.evaluate

test:            ## backend test suite
	cd backend && python -m pytest -q

cov:             ## tests with coverage report (CI fails under 85%)
	cd backend && python -m pytest -q --cov=app --cov=ml --cov-report=term-missing:skip-covered --cov-fail-under=85

lint:
	cd backend && ruff check .

mlflow:          ## experiment-tracking UI on http://127.0.0.1:5000 (the UI needs the full package: pip install mlflow)
	cd backend && mlflow ui --backend-store-uri sqlite:///mlflow.db

drift:           ## PSI drift report for a batch of inputs: make drift FILE=new_rows.json
	cd backend && python -m ml.drift --current $(FILE)

backend:         ## API on http://127.0.0.1:8000/docs
	cd backend && LOG_FORMAT=text python -m uvicorn app.main:app --reload

frontend:        ## dashboard on http://localhost:5175
	cd frontend && npm run dev

docker:          ## build and run API + dashboard
	docker compose up --build
