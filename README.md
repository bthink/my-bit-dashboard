# My Bit Dashboard

Recruitment project: a frontend application for managing orders and analyzing them in a dashboard.  
Stack: React + TypeScript + Vite, with local persistence and automated tests.

## What the app includes

- `Dashboard` view with core metrics and charts for orders.
- `Order Overview` view for full order CRUD (create, edit, view, delete).
- Orders are managed through a single source of truth shared across views, so CRUD operations are reflected immediately in both the dashboard metrics and the orders table.
- Domain-level data validation and error handling.
- `Dev Panel` (development-only) for quick test-data generation.
- Persistence in `localStorage` via a dedicated repository.

## Run locally

```bash
npm install
npm run dev
```

After Vite starts, the app is available at the URL shown in the terminal (by default `http://localhost:5173`).

## Available scripts

- `npm run dev` - starts the development server
- `npm run build` - runs type-checking and creates a production build
- `npm run preview` - runs a local preview of the production build
- `npm run lint` - runs ESLint
- `npm run test` - runs tests once
- `npm run test:watch` - runs tests in watch mode

## Why there is an artificial delay

In this project, read and write operations are intentionally delayed by a random `200-1500 ms` (see `src/application/orders/delay.ts`).

This delay simulates real API conditions (network and backend latency), so the UI behavior is closer to a production scenario:

- loading and saving states are clearly visible,
- async edge cases are easier to surface,
- it verifies that the UI does not assume an instant response.

This helps test not only happy paths, but also app behavior under realistic response times.

## Project docs

- `docs/TOOLS.md` - tools used and why they were chosen
- `docs/WORKFLOW.md` - development workflow, setup, and quality approach
