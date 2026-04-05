# Agent Development Guide - Events Service UI

As a Senior Product Manager, this document outlines the core principles, architecture, and development standards for the **Events Service UI** project. This guide is designed to help AI agents and developers maintain a high standard of quality and consistency.

## Project Vision

The **Events Service UI** is a modern, high-performance web application built to manage and monitor events. It leverages a cutting-edge tech stack to ensure reliability, scalability, and an exceptional user experience.

## Core Tech Stack

- **Framework**: React 19 (Modern, concurrent-ready)
- **Build Tool**: Vite 8 (Fast development and optimized builds)
- **Language**: TypeScript 5.9 (Strict typing and type safety)
- **Styling**: Tailwind CSS 4.2.2 (Utility-first, responsive design)
- **Routing**: TanStack Router (Type-safe, search-param-first routing)
- **Data Fetching**: TanStack Query v5 (Powerful state management and caching)
- **Validation**: Zod (Schema-based validation for APIs and forms)
- **Testing**: Vitest + React Testing Library (Fast, reliable unit and integration tests)

## Architecture & Structure

The project follows a modular, domain-driven structure within the `src` directory:

- **`src/components`**: UI components categorized by scope:
  - `ui`: Atomic, reusable UI components (buttons, inputs, etc.)
  - `layout`: Structural components (headers, footers, sidebars)
  - `dashboard`: Domain-specific components for the dashboard
- **`src/routes`**: File-based routing with TanStack Router.
- **`src/hooks`**: Custom hooks for business logic and data orchestration.
- **`src/services`**: API client and service layer (using `api.ts`).
- **`src/types`**: Shared TypeScript interfaces and types.
- **`src/utils`**: Helper functions and utility logic.

## AI Development Rules & Instructions

### 1. Type Safety First

- **Strict Typing**: Always define interfaces or types for every component prop, hook return, and API response.
- **Zod Schemas**: Use Zod for runtime validation, especially for API data. This ensures the UI is resilient to backend changes.
- **No `any`**: The use of `any` is strictly prohibited. Use `unknown` or generics if necessary.

### 2. State Management

- **TanStack Query**: Use `useQuery` and `useMutation` for all server-side state. Avoid local `useState` for data that comes from the API.
- **URL-First State**: Prefer TanStack Router's search params for UI state that should be shareable or persisted (e.g., filters, pagination).

### 3. Styling & UI

- **Tailwind Utility-First**: Use Tailwind classes for all styling. Avoid custom CSS files unless absolutely necessary.
- **Class Merging**: Use the `cn` utility (combining `clsx` and `tailwind-merge`) for dynamic class names.
- **Responsive Design**: Always consider mobile-first responsiveness using Tailwind's breakpoints.

### 4. Component Design

- **Functional Components**: Use only functional components with React Hooks.
- **Purity**: Keep components as pure as possible. Move side effects to hooks or services.
- **Accessibility (a11y)**: Ensure components are accessible (semantic HTML, ARIA attributes).

### 5. API Communication

- **Centralized Services**: All API calls must go through `src/services/api.ts`.
- **Error Handling**: Implement consistent error handling at the service or hook level.

### 6. Testing Standards

- **Component Tests**: Every new UI component or significant feature must have a corresponding `.test.ts` or `.test.tsx` file.
- **Vitest**: Use Vitest for all unit and integration tests.
- **Testing Library**: Prefer `react-testing-library` for user-centric component testing.

### 7. Code Quality

- **Linting**: Follow the rules defined in `eslint.config.js`.
- **Formatting**: Maintain consistent code formatting as defined by the project's Prettier/ESLint setup.

## Development Workflow

1. **Explore**: Understand the existing code and patterns before adding new features.
2. **Implement**: Write clean, type-safe code following the rules above.
3. **Test**: Ensure the new code is covered by tests.
4. **Verify**: Run `npm run lint` and `npm run test` before submitting changes.

---
*Created by Senior Product Manager for Agent Development.*
