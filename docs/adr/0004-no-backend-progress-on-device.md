# No backend: each Learner's progress lives only on their own device

The app is static files on GitHub Pages, with no accounts and no server. Spaced-repetition progress, Flags and settings are stored on the Learner's device, with an export/import backup as the only way to move them. This lets anyone with the link start immediately, keeps no personal data anywhere, and leaves nothing to run or pay for.

## Consequences

- Progress doesn't follow a Learner to a new phone unless they export it first.
- Anything that has to reach Carl (Flags, later Incidents) has to leave the device through the Learner's own messaging or email, not through an API.
- Adding synced accounts later is an addition (a sync layer over the local store), not a rewrite, as long as the local store stays the source of truth.
