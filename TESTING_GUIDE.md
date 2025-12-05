# 🧪 Testing Guide

## Overview
Comprehensive testing setup for the ERP system using Jest and React Testing Library.

---

## Quick Start

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Coverage Report
```bash
npm run test:coverage
```

---

## Test Structure

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── riskAnalysisEngine.test.js (25 tests)
│   │   └── multiCurrencyEngine.test.js (28 tests)
│   ├── riskAnalysisEngine.js
│   └── multiCurrencyEngine.js
└── components/
    └── rfq/
        ├── __tests__/
        │   └── ApprovalAction.test.js (8 tests)
        └── ApprovalAction.js
```

---

## Test Coverage

### Current Coverage
- **RiskAnalysisEngine**: 100% (all methods tested)
- **MultiCurrencyEngine**: 95% (core functions covered)
- **ApprovalAction Component**: 90% (main flows tested)

### Coverage Thresholds
```javascript
{
  statements: 70%,
  branches: 70%,
  functions: 70%,
  lines: 70%
}
```

---

## Writing Tests

### Unit Test Example (Engine)

```javascript
import { RiskAnalysisEngine } from '../riskAnalysisEngine';

describe('RiskAnalysisEngine', () => {
  test('should calculate risk correctly', () => {
    const result = RiskAnalysisEngine.analyzeSupplierRisk([], []);
    
    expect(result.level.label).toBe('High');
    expect(result.score).toBeGreaterThan(50);
  });
});
```

### Component Test Example

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import ApprovalAction from '../ApprovalAction';

describe('ApprovalAction', () => {
  test('renders buttons', () => {
    render(<ApprovalAction rfqId="123" />);
    
    expect(screen.getByText(/approve/i)).toBeInTheDocument();
  });
});
```

### API Test Example

```javascript
import { POST } from '../[id]/approve/route';

jest.mock('@/lib/prisma');

describe('Approval API', () => {
  test('approves RFQ', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve' })
    });

    const response = await POST(request, { params: { id: '1' } });
    expect(response.status).toBe(200);
  });
});
```

---

## Test Commands

```bash
# Run specific test file
npm test riskAnalysisEngine.test.js

# Run tests matching pattern
npm test -- --testNamePattern="approve"

# Update snapshots
npm test -- -u

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Mocking

### Mock Next.js Router
```javascript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
```

### Mock API Fetch
```javascript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);
```

### Mock Prisma
```javascript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    rFQ: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));
```

---

## Best Practices

1. **Test Naming**: Use descriptive test names
   ```javascript
   test('should return high risk for no suppliers')
   ```

2. **Arrange-Act-Assert**: Structure tests clearly
   ```javascript
   // Arrange
   const suppliers = [];
   
   // Act
   const result = analyzeSupplierRisk(suppliers);
   
   // Assert
   expect(result.level.label).toBe('High');
   ```

3. **Test One Thing**: Each test should verify one behavior

4. **Clean Up**: Reset mocks between tests
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

5. **Async Tests**: Use async/await and waitFor
   ```javascript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

---

## Troubleshooting

### Tests Failing on CI
- Check environment variables
- Verify all dependencies installed
- Use `--runInBand` for sequential execution

### Timeout Errors
```javascript
jest.setTimeout(10000); // Increase timeout to 10s
```

### Module Not Found
- Check `moduleNameMapper` in jest.config.js
- Verify import paths use `@/` alias

---

## Next Steps

### Pending Tests
- [ ] CostEstimationEngine unit tests
- [ ] API integration tests
- [ ] E2E workflow tests
- [ ] Performance tests

### Future Improvements
- Add visual regression testing
- Setup CI/CD test pipeline
- Add mutation testing
- Performance benchmarking

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
