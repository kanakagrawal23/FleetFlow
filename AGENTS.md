# FleetFlow - Agent Guidelines

This file contains guidelines for agentic coding assistants working in this repository.

## Build, Lint, and Test Commands

```bash
# Development
bun run dev              # Start development server (http://localhost:3000)

# Build and Quality
bun run build            # Build for production
bun run lint             # Run ESLint (includes TypeScript checking)

# Database Operations
bun run db:push          # Push schema changes directly to database
bun run db:generate      # Generate migration files
bun run db:migrate       # Run pending migrations
bun run db:studio        # Open Drizzle Studio UI

# Testing
# Note: No test framework is currently configured. If adding tests:
# - Configure test framework (Jest, Vitest, etc.)
# - Add test script to package.json
# - Running single test: bun test <file-path> (once configured)
```

## Code Style Guidelines

### Imports
- Use `import type { ... }` for type-only imports
- Absolute imports with `@/*` alias for internal modules: `@/lib/utils`, `@/components/ui/button`
- Group imports: type imports → third-party → internal/relative
- Example:
  ```ts
  import type { Metadata } from "next";
  import { Geist } from "next/font/google";
  import Header from "@/components/header";
  ```

### Formatting
- **Tabs** for indentation (not spaces)
- `"use client"` or `"use server"` directive at file top when needed
- PascalCase for components, camelCase for functions/variables
- Single quotes for JSX attributes, double quotes for TS/JS strings

### Types
- Strict TypeScript enabled (`strict: true` in tsconfig.json)
- Use **Zod** for validation schemas
- Infer types from libraries: `typeof authClient.$Infer.Session`
- Component props: inline interface or `Readonly<{ children: React.ReactNode }>`
- Use `React.ComponentProps<"button">` for extending native element props

### Naming Conventions
- **Components**: PascalCase (`SignInForm`, `Button`)
- **Functions**: camelCase (`onboardDriver`, `cn`)
- **Variables**: camelCase (`geistSans`, `authClient`)
- **DB Tables**: lowercase (`trip`, `vehicle`, `service`)
- **Enums**: PascalCase, camelCase values (`tripStatusEnum`, `["started", "completed"]`)

### Error Handling
- Return error objects from server actions: `{ error: "message" }`
- Use `toast.error()` and `toast.success()` for user notifications (Sonner)
- Try-catch in server actions with `console.error` logging
- Validate inputs early and return descriptive errors

### Database (Drizzle ORM)
- Schema files in `lib/db/schema/`
- Use `pgTable` for table definitions
- Timestamps pattern:
  ```ts
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ```
- Enums: `pgEnum("enum_name", ["value1", "value2"])`
- Centralized db instance: `import { db } from "@/lib/db"`

### UI Components
- Based on shadcn/ui with "new-york" style
- Utility-first Tailwind CSS classes
- Use `cn()` utility for conditional class merging (`import { cn } from "@/lib/utils"`)
- Base UI components in `components/ui/`, feature components in `components/`
- CVA for variants: `class-variance-authority`

### React Patterns
- Function components only (no class components)
- Client state with hooks (`useState`, `useReducer`)
- Controlled components for forms
- Server components by default, `"use client"` only when necessary
- Server actions in `app/**/actions.ts` files

### Authentication (Better-Auth)
- Config: `lib/auth/index.ts`
- Client: `lib/auth/auth-client.ts` (authClient)
- Server session: `await auth.api.getSession({ headers: await headers() })`
- Protect server actions by checking session and user role

### Environment Variables
- Typed with @t3-oss/env-nextjs
- Server-only: `lib/env/server.ts` → `import { env } from "@/lib/env/server"`
- Web-accessible: `lib/env/web.ts`
- Never hardcode secrets; use env vars

### File Organization
```
app/                    # Next.js App Router (pages, layouts, API routes)
components/             # React components
  └── ui/              # shadcn/ui base components
lib/                    # Library code
  ├── auth/            # Authentication configuration
  ├── db/              # Database schema & connection
  │   └── schema/      # Drizzle schema definitions
  └── env/             # Environment variable schemas
```

### Best Practices
- Prefer server components; mark client components only when needed
- Use native Web APIs (fetch, FormData) over third-party HTTP clients
- Leverage Next.js built-in features (image, font optimization)
- Keep components small and focused (single responsibility)
- Use TypeScript to catch errors at build time
- Run `bun run lint` before committing
- Run `bun run build` to verify production readiness
