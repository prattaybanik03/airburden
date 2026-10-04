# Deployment

The repository ships a [Render Blueprint](../render.yaml) that deploys both services on free plans.

1. In Render choose **New > Blueprint** and select this repository.
2. When prompted, enter the environment values:
   * `airburden-api`: `CORS_ORIGINS` (the dashboard URL). `IQAIR_API_KEY`, `OPENCAGE_API_KEY` and `NEWS_API_KEY` are optional; without them only the live air-quality and news panels return 503.
   * `airburden`: `VITE_BACKEND_URL` (the API URL).
3. Deploy. The API image trains the model from `data/dataset.json` at build time, so no artifacts are stored in the repository.

Free instances sleep when idle, so the first request after a pause can take about a minute.

The same images run anywhere with `docker compose up --build`.

## Model versioning

Every training run records the model version, the git commit, the SHA-256 of the dataset and the training parameters in the bundle.
`GET /model_info` returns them under `meta`, so any prediction can be traced back to the code and data that produced it.
The service logs a warning if the installed scikit-learn differs from the version the bundle was trained with.
