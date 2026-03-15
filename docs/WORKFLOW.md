# Development Workflow

This project is built around a clear workflow: fast iteration, testability, and quality control.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Validate changes:

```bash
npm run test
npm run lint
```

4. Verify production build:

```bash
npm run build
npm run preview
```

## How features are implemented

Practical workflow in this project:

1. Start with domain logic (data model, validation, error cases).
2. Continue with application layer (store/use-cases and repository integration).
3. Finish with UI and async states (loading/saving/error).
4. Run tests and lint as the final quality gate.
