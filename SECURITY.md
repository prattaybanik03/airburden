# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Report them privately through
[GitHub private vulnerability reporting](https://github.com/prattaybanik03/airburden/security/advisories/new).
I aim to acknowledge reports within 72 hours and to agree on a fix and disclosure date with you.

## Scope

The FastAPI service (`backend/app`), the ML pipeline (`backend/ml`), the React dashboard (`frontend/`), the Docker images
and the CI workflows. Third-party APIs (IQAir, OpenCage, NewsAPI) are out of scope; report issues with them to their owners.

## How the repository is protected

| Control | Where |
|---|---|
| `main` accepts changes only through pull requests with green CI (tests, pipeline gates, Docker smoke test, CodeQL); force pushes and deletion are blocked | [`.github/rulesets/protect-main.json`](.github/rulesets/protect-main.json) |
| Release tags `v*` cannot be moved or deleted | [`.github/rulesets/protect-tags.json`](.github/rulesets/protect-tags.json) |
| Code scanning (CodeQL) on every PR and weekly; PRs adding dependencies with high-severity CVEs fail | [`.github/workflows/security.yml`](.github/workflows/security.yml) |
| Weekly dependency update PRs | [`.github/dependabot.yml`](.github/dependabot.yml) |
| Workflows run with a read-only `GITHUB_TOKEN` by default | `permissions:` in each workflow |
| API keys only come from the environment and are never logged or committed; `detect-private-key` runs in pre-commit | `backend/.env.example`, `.pre-commit-config.yaml` |
| Containers run as a non-root user | `backend/Dockerfile` |
