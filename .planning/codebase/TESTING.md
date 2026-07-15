# Testing Patterns

**Analysis Date:** 2026-07-15

## Test Framework

**Status:** Not configured

**Runner:**
- Not detected
- No testing package in `package.json` dependencies
- Jest, Vitest, or other test runner not installed

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
npm run lint              # Run ESLint (only code quality tool available)
npm run dev              # Run development server
npm run build            # Build project
npm run start            # Start production server
```

## Test File Organization

**Location:**
- No test files currently present in codebase
- When adding tests, use co-located pattern: place `.test.tsx` or `.spec.tsx` files next to source files

**Naming:**
- Recommended pattern: `[component].test.tsx` or `[component].spec.tsx`
- Example: `app/layout.test.tsx` for testing `app/layout.tsx`
- Example: `app/page.test.tsx` for testing `app/page.tsx`

**Structure:**
- Not applicable (no tests yet)
- When implemented, follow: `app/__tests__/` directory OR co-located with source files

## Test Structure

**Suite Organization:**
- Not implemented
- Recommended pattern when adding tests:

```typescript
describe('RootLayout', () => {
  describe('metadata', () => {
    it('should have correct title', () => {
      // test implementation
    });
    
    it('should have correct description', () => {
      // test implementation
    });
  });

  describe('rendering', () => {
    it('should render children', () => {
      // test implementation
    });

    it('should include fonts', () => {
      // test implementation
    });
  });
});
```

**Patterns:**
- Use `describe()` to group related tests
- Use `it()` or `test()` for individual test cases
- Setup: Use `beforeEach()` for common test setup
- Teardown: Use `afterEach()` for cleanup if needed
- Assertion pattern: Simple assertions checking return values or DOM state

## Mocking

**Framework:**
- Not applicable (no testing framework installed)
- When added, use framework built-in mocking (Jest: `jest.mock()`, Vitest: `vi.mock()`)

**Patterns:**
- Mock Next.js Image component: Mock `next/image` to avoid browser-specific code
- Mock fetch calls: Mock `fetch()` or use MSW (Mock Service Worker) for API integration tests
- Mock fonts: Mock `next/font/google` to avoid loading real fonts in tests

Example mocking pattern (when test framework added):
```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Mock implementation
    return <img {...props} />;
  },
}));
```

**What to Mock:**
- External API calls (Stripe, databases, third-party services)
- Next.js framework modules that require browser/server environment setup
- File system operations in server-side code
- Date/time if testing time-dependent logic

**What NOT to Mock:**
- Component rendering logic (test actual output)
- React hooks and state management (use testing library utilities)
- User interactions and event handlers
- Core business logic (test actual implementation)

## Fixtures and Factories

**Test Data:**
- Not applicable (no tests yet)
- Recommended pattern when needed:

```typescript
// In __fixtures__/data.ts or alongside test file
export const mockMetadata = {
  title: "NQD Realty - Where Vision Meets Value in Real Estate",
  description: "Premium real estate company...",
};

export const mockLayoutProps = {
  children: <div>Test Content</div>,
};
```

**Location:**
- Place test utilities in `__fixtures__/` directory at project root
- Or co-locate in same file as test (for simple cases)
- Create factories for complex objects: `createMockLayoutProps()`, `createMockUser()`

## Coverage

**Requirements:** Not enforced

**View Coverage:**
```bash
# When test framework added, use:
npm run test -- --coverage

# Coverage configuration typically in jest.config.js or vitest.config.ts
```

**Target Goals (recommended):**
- Minimum 80% coverage for critical paths
- Aim for 100% on utility functions and services
- Component snapshot testing for UI consistency

## Test Types

**Unit Tests:**
- Scope: Individual components, functions, utilities
- Approach: Test component rendering, prop handling, state changes
- Example: Test that `RootLayout` applies correct font variables to body
- Current files to test: `app/layout.tsx`, `app/page.tsx`

**Integration Tests:**
- Scope: Multiple components working together
- Approach: Test page routes, component interactions, data flow
- Example: Test full page rendering with navigation and services section
- When to add: When adding multiple interconnected components

**E2E Tests:**
- Framework: Not configured
- Tools: Would use Playwright, Cypress, or similar
- Not required for current simple single-page application
- Consider adding when: Features become more complex, user flows need validation

## Common Patterns

**Async Testing:**
```typescript
// Using async/await in tests
it('should load data', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

// When test framework added, handle async properly:
it('should update state', (done) => {
  component.onLoad(() => {
    expect(component.isLoaded).toBe(true);
    done();
  });
});
```

**Error Testing:**
```typescript
// Testing error scenarios
it('should handle missing image', () => {
  const { container } = render(
    <Image src="invalid.jpg" alt="test" width={100} height={100} />
  );
  // Test error state or fallback rendering
});

// Testing error boundaries
it('should catch component errors', () => {
  expect(() => {
    render(<BrokenComponent />);
  }).toThrow();
});
```

## Getting Started with Testing

**When to add a test framework:**
1. Add testing package: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom`
2. Create config file: `jest.config.js` with Next.js preset
3. Update `package.json` scripts: Add `"test": "jest --watch"`
4. Create first test in `app/layout.test.tsx`

**Recommended test framework:** Jest with React Testing Library (standard for Next.js projects)

**Alternative:** Vitest for faster test execution

---

*Testing analysis: 2026-07-15*
