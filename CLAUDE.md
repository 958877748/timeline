# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timeline Tool is a TypeScript-based timeline editing library with React UI components, designed as a pure data-driven timeline tool similar to Unity Timeline. The project follows a clean three-layer architecture pattern.

## Essential Commands

### Development
```bash
npm run dev          # Start React demo at http://localhost:3000
npm run build        # Build TypeScript library to dist/
npm run build:react  # Build React demo with Vite
```

### Testing & Quality
```bash
npm test                    # Run all tests
npm run test:coverage       # Run tests with coverage report
npm run lint               # Run ESLint
```

### Single Test Execution
```bash
npm test -- tests/models/TimelineModel.test.ts  # Run specific test file
npm test -- --watch                            # Run tests in watch mode
```

## Architecture

### Three-Layer Design

1. **Data Layer** (`src/models/`, `src/utils/`, `src/types/`)
   - Pure TypeScript logic, framework-agnostic
   - Immutable operations and pure functions
   - Core timeline data structures and validation

2. **Glue Layer** (`src/hooks/`, `src/adapters/`)
   - Connects React components to pure data logic
   - `useTimeline`, `useTrack`, `useTimelineObject` hooks
   - `TimelineAdapter` for lifecycle management

3. **UI Layer** (`src/components/`)
   - Pure React components with props/callbacks
   - CSS Modules for styling (supports dark theme)
   - Tweakpane integration for property editing

### Key Components

- **Timeline**: Main visualization component with multi-track support
- **Track**: Individual track management with drag-and-drop
- **TimelineObject**: Duration/instant object rendering and manipulation
- **PropertyEditor**: Tweakpane-based property editing interface
- **TimelineControls**: Playback and view controls

### State Management Pattern

The project uses a custom hook-based state management approach:
- `useTimeline` manages the main timeline state
- Components receive data via props and emit changes via callbacks
- State changes flow through the adapter layer to maintain React lifecycle compatibility

## Code Style Guidelines

- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **Formatting**: 2-space indentation, single quotes, semicolons required
- **Line Length**: Max 120 characters
- **Component Pattern**: Functional components with TypeScript interfaces
- **CSS**: CSS Modules with camelCase convention, supports theming

## Testing Approach

- **Framework**: Jest with React Testing Library
- **Coverage**: Comprehensive test suites for models, utilities, and React components
- **Mock Data**: Located in `src/data/` for testing scenarios
- **Environment**: jsdom for DOM testing capabilities

## Build Outputs

- **Library**: `dist/` (CommonJS + TypeScript declarations)
- **Demo**: `examples/dist/` (Vite build output)
- **Entry Point**: `dist/index.js` with full TypeScript support