# Shared App Code

Use this folder for app-level code that is reused by multiple features and does not belong in `packages/ui`.

- `components/`: app-specific reusable components
- `hooks/`: app-specific reusable hooks
- `lib/`: app-specific utilities, clients, and configuration

Feature-specific code should stay in `src/features/<feature-name>` until it has a second consumer.
