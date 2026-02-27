# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # tsc -b && vite build (type-check then bundle)
npm run lint         # ESLint with TypeScript + React Hooks rules
npm run preview      # Serve production build locally

npm run test         # Run Vitest in watch mode
npm run test:ui      # Vitest with interactive browser UI
npm run test:coverage # Generate coverage report
```

To run a single test file:
```bash
npx vitest run src/services/authService.test.ts
```

## Environment

Requires a `.env` file at the project root:
```
VITE_API_BASE_URL=http://your-backend-url
```

All service files read `import.meta.env.VITE_API_BASE_URL` as the backend base URL.

## Architecture

### Role-Based Access Control
Three roles drive the entire UX: **ADMIN**, **ANALISTA**, **OPERARIO**. The JWT payload contains `rol`, `sub` (username), `name`, and `exp`. The `useAuthData` hook (`src/hooks/useAuthData.ts`) decodes the stored token to expose the current user's role and name throughout the app. `ProtectedRoute` (`src/components/utils/ProtectedRoute.tsx`) wraps routes to enforce role access and redirect expired sessions to `/login`.

### Routing & Layout
`App.tsx` defines all routes using React Router v7 with `React.lazy()` + `Suspense` for code splitting on every page. All authenticated pages render inside `AdminLayout` (`src/components/layout/AdminLayout.tsx`), which provides the sidebar (links change per role), header with `NotificationBell` and `ProfileMenu`, and the Sonner toast container.

Role-to-dashboard redirects happen at `/dashboard`: OPERARIO → `/operator/dashboard`, ANALISTA → `/analyst/dashboard`, ADMIN stays at `/dashboard`.

### Service Layer
`src/services/` contains one file per domain (e.g., `farmService.ts`, `irrigationService.ts`). All services use the native `fetch` API with a `Bearer` token from `localStorage` (`authToken` key). There is no shared HTTP client — each service constructs requests independently.

TanStack Query v5 is the only server-state manager. Components call service functions inside `useQuery`/`useMutation` hooks. The `QueryClient` is instantiated once in `main.tsx`.

### Type Definitions
`src/types/` mirrors the service layer — one types file per domain. All API request/response shapes and UI models live here. TypeScript strict mode is on (`noUnusedLocals`, `noUnusedParameters`).

### Styling
Each component has a co-located `.css` file. Global design tokens (colors, spacing, shadows, typography) are CSS custom properties defined in `src/index.css`. Primary brand color is `#10b981` (emerald). Fonts are `Inter` (body) and `Outfit` (headings) loaded from Google Fonts. Global utility classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.form-field`, `.form-label`.

### Testing
Test files are co-located with the code they test (`.test.ts` / `.test.tsx`). The setup file is `src/setupTests.ts` (imports `@testing-library/jest-dom`). Vitest runs in JSDOM with globals enabled. Service tests mock `fetch` globally; component tests use `@testing-library/react`.
