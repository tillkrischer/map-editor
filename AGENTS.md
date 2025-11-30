# Agent Guidelines for map-editor

## Build/Lint/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Type check (tsc -b) and build for production
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build
- No test suite configured (no test runner present)

## Code Style Guidelines

### TypeScript
- Use strict mode with all strict flags enabled (noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch)
- Define types explicitly for function parameters and component props (e.g., `type RGB = [number, number, number]`)
- Use `type` for object shapes and type aliases, not `interface`
- Enable verbatimModuleSyntax - import types using `import type` syntax

### React
- Use React 19 with functional components and hooks
- Import types explicitly: `import { type ChangeEvent } from "react"`
- Prop types should be inline interfaces or named types passed to component (e.g., `function Sidebar(props: { palettes: Palette[] })`)
- Use destructuring for props in component body
- React Compiler is enabled via babel-plugin-react-compiler

### Formatting & Imports
- Use double quotes for strings, semicolons required
- 2-space indentation
- Import order: external packages, then types (using `import type`)
- Group imports logically (React hooks, types, etc.)

### Naming
- PascalCase for components and types
- camelCase for variables, functions, and props
- SCREAMING_SNAKE_CASE for true constants (e.g., `BLOCK_SIZE`)

### Styling
- Tailwind CSS v4 via @tailwindcss/vite plugin for all styling
- Use Tailwind utility classes directly in JSX className props
