# Tools Used

This document describes the technologies selected for the project goal: a fast frontend with clear architecture and realistic data workflows.

## Core stack

- **React 19** - UI layer and component-driven architecture
- **TypeScript** - safer refactoring and clear type contracts
- **Vite 8** - fast development server and build pipeline

## UI and UX

- **Tailwind CSS 4** - fast, predictable styling
- **Lucide React** - consistent icon set
- **clsx** - clean conditional class composition

## Routing, charts, and performance

- **React Router 7** - view routing (`/dashboard`, `/orders`, plus `/dev` in development builds)
- **Recharts** - order data visualization
- **@tanstack/react-virtual** - more efficient table rendering for larger datasets

## Quality and testing

- **ESLint** - code quality checks
- **Prettier** - formatting consistency
- **Vitest** - fast unit and integration tests
- **Testing Library + jsdom** - behavior-focused component testing

## Supporting tools

- **Cursor** - used as the main IDE with AI-assisted features to support day-to-day development
- **Adobe Color (Extract Theme)** - used to extract and separate brand colors from an image, then translate them into the app color palette (https://color.adobe.com/pl/create/image)

AI assistance was used only as a productivity tool. Architecture decisions, business logic, and final implementation were designed and validated manually.
