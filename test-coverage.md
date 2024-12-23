# Test Coverage Report

The project has been set up with Jest and React Testing Library with the following test coverage:

## Test Files
1. `App.test.tsx`
   - Tests the main App component
   - Verifies welcome message rendering
   - Verifies HeroBanner component integration

2. `HeroBanner.test.tsx`
   - Tests the HeroBanner component
   - Verifies initial render
   - Tests navigation controls (next/previous)
   - Tests auto-rotation functionality
   - Tests pause/resume on hover

## Running Tests
To run tests with coverage report:
```bash
npm test
```

To run tests in watch mode:
```bash
npm run test:watch
```

## Current Test Coverage
The test suite covers:
- Component rendering
- User interactions (clicks, hover states)
- Timer-based functionality
- Component integration

Coverage metrics will be displayed in the terminal after running `npm test`, and a detailed lcov report will be generated in the `coverage` directory.