# Repository rulesets

These JSON files are the repository's branch and tag protection, kept in version control so they can be
reviewed and re-applied. GitHub does not apply them automatically: import them once.

**Settings → Rules → Rulesets → New ruleset → Import a ruleset**, then pick the file and click **Create**:

| File | Effect |
|---|---|
| `protect-main.json` | `main` can only change through a pull request whose required checks are green and whose review threads are resolved. Force pushes and branch deletion are blocked. Repository admins can bypass only through a pull request, for emergencies. |
| `protect-tags.json` | Release tags (`v*`) cannot be deleted, moved or overwritten. |

`required_approving_review_count` is 0 because this is a single-maintainer repository: GitHub does not let you approve
your own pull request, so requiring an approval would block every change. Raise it to 1 (and set
`require_code_owner_review` to true, see `.github/CODEOWNERS`) once there is a second maintainer.

If a CI job is renamed, update its `context` here too, otherwise the required check never reports and merges are blocked.
