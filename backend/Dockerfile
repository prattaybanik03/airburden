# syntax=docker/dockerfile:1
# Two stages:
#   train    installs the training stack, runs the full pipeline (validate -> train -> evaluate -> gate).
#            The build FAILS if the data breaks its contract or the model misses a release gate.
#   runtime  slim serving image: API code + the gated model bundle, without pandera/pyarrow or the dataset.

FROM python:3.15-slim AS train
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /srv
COPY backend/requirements-train.lock backend/requirements-train.lock
RUN pip install --no-cache-dir -r backend/requirements-train.lock
COPY backend backend
COPY data data
WORKDIR /srv/backend
ARG GIT_COMMIT=unknown
ARG RENDER_GIT_COMMIT=
ENV GIT_COMMIT=$GIT_COMMIT RENDER_GIT_COMMIT=$RENDER_GIT_COMMIT
RUN python -m ml.pipeline run --no-track

FROM python:3.15-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_DISABLE_PIP_VERSION_CHECK=1 \
    MODEL_PATH=/srv/backend/artifacts/model_bundle.joblib
WORKDIR /srv/backend
COPY backend/requirements.lock requirements.lock
RUN pip install --no-cache-dir -r requirements.lock
COPY --chmod=a+rX backend/app app
COPY --chmod=a+rX backend/ml/__init__.py backend/ml/data.py backend/ml/train.py ml/
COPY --from=train --chmod=a+rX /srv/backend/artifacts/model_bundle.joblib /srv/backend/artifacts/metadata.json /srv/backend/artifacts/model_card.md artifacts/
COPY --from=train --chmod=a+rX /srv/backend/artifacts/reports artifacts/reports
ARG RENDER_GIT_COMMIT=
ENV RENDER_GIT_COMMIT=$RENDER_GIT_COMMIT

RUN useradd --system --no-create-home app
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request as u; u.urlopen('http://127.0.0.1:8000/ready')"
# uvicorn's own access log is off: the app writes structured JSON access logs with request IDs.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--no-access-log"]
