# Print-on-Demand Connector Tests

Comprehensive unit tests for Printify and Printful API integrations.

## Test Files

- `printify-connector.test.ts` - 42 tests
- `printful-connector.test.ts` - 49 tests

**Total: 91 tests**

## Coverage

### Printify Connector

#### OAuth Authentication (7 tests)
- ✅ OAuth URL generation with proper scopes
- ✅ Authorization code exchange for access token
- ✅ Access token refresh
- ✅ Error handling (invalid codes, expired tokens, network errors)

#### Product Management (8 tests)
- ✅ Create product with variants and images
- ✅ Update product details
- ✅ Delete product
- ✅ List products with pagination
- ✅ Error handling (validation errors, authentication errors, not found)

#### Image Upload (3 tests)
- ✅ Successful image upload
- ✅ Invalid image format handling
- ✅ File size limit errors

#### Blueprints & Providers (3 tests)
- ✅ Fetch available blueprints
- ✅ Get print providers for blueprint
- ✅ Get variants for blueprint/provider combination

#### Cost Calculation (2 tests)
- ✅ Calculate production, shipping, and profit margins
- ✅ Handle invalid variant IDs

#### Order Management (6 tests)
- ✅ Create order with line items and shipping
- ✅ Fetch order details
- ✅ Cancel order
- ✅ Error handling (validation, out of stock, fulfilled orders)

#### Webhooks (6 tests)
- ✅ Register webhook URLs
- ✅ Handle order lifecycle events (created, updated, shipped, delivered)
- ✅ Handle unknown event types gracefully
- ✅ Error handling (invalid URLs)

#### Rate Limiting (1 test)
- ✅ Handle 429 rate limit responses with retry

#### Error Handling (4 tests)
- ✅ 401 unauthorized errors
- ✅ 500 server errors with retry
- ✅ Network timeout (ETIMEDOUT)
- ✅ Connection reset (ECONNRESET)

#### Connection Testing (2 tests)
- ✅ Test valid credentials
- ✅ Test invalid credentials

---

### Printful Connector

#### Authentication (3 tests)
- ✅ API key authentication
- ✅ Invalid key handling
- ✅ Missing key handling

#### Catalog Products (5 tests)
- ✅ Fetch all catalog products
- ✅ Get specific product details
- ✅ Get product variants
- ✅ Error handling (not found, server errors)

#### Sync Products (7 tests)
- ✅ Create sync product with variants and files
- ✅ Update sync product
- ✅ Delete sync product
- ✅ List all sync products
- ✅ Get specific sync product
- ✅ Error handling (validation, file upload errors, not found)

#### Order Management (10 tests)
- ✅ Create order with recipient and items
- ✅ Fetch order by ID
- ✅ Fetch order by external ID
- ✅ List orders with filtering
- ✅ List orders with pagination
- ✅ Cancel order
- ✅ Error handling (validation, out of stock, not found, cannot cancel fulfilled)

#### Shipping Costs (4 tests)
- ✅ Estimate order costs
- ✅ Calculate shipping rates
- ✅ Handle invalid addresses
- ✅ Handle unavailable shipping destinations

#### Webhooks (8 tests)
- ✅ Register webhook with event types
- ✅ List registered webhooks
- ✅ Delete webhook
- ✅ Handle package shipped events
- ✅ Handle order failed events
- ✅ Handle product synced events
- ✅ Handle unknown event types
- ✅ Error handling (invalid URLs)

#### Rate Limiting (2 tests)
- ✅ Handle 429 rate limit responses
- ✅ Respect rate limit windows

#### Error Handling (6 tests)
- ✅ 401 unauthorized errors
- ✅ 500 server errors with retry
- ✅ Network timeouts
- ✅ Connection resets
- ✅ Malformed JSON responses
- ✅ Empty response bodies

#### Mockup Generation (1 test)
- ✅ Generate mockup for variants

---

## Test Patterns

### Mocking Strategy
```typescript
// Database mocking
vi.mock("../../../../server/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// HTTP mocking
global.fetch = vi.fn();

// Observability mocking
vi.mock("../../../../server/lib/observability", () => ({
  createLogger: vi.fn(() => ({ info, warn, error, debug })),
  withRetry: vi.fn((fn) => fn()),
  CircuitBreaker: class MockCircuitBreaker {
    execute(fn) { return fn(); }
  },
  recordMetric: vi.fn(),
  trackError: vi.fn(),
}));
```

### Helper Functions
```typescript
// Setup mock database connection
function setupMockConnection(credentials) {
  mockDb.select.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([{
          status: "connected",
          credentials: credentials,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
        }]),
      }),
    }),
  });
}
```

### Test Structure
```typescript
describe("Feature", () => {
  beforeEach(() => {
    setupMockConnection(mockCredentials);
  });

  describe("method", () => {
    it("should handle happy path", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await connector.method();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(/*...*/);
    });

    it("should handle error case", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Error" }),
      });

      // Act & Assert
      await expect(connector.method()).rejects.toThrow("Error");
    });
  });
});
```

## Running Tests

```bash
# Run all integration tests
npx vitest run tests/unit/server/integrations/

# Run specific connector tests
npx vitest run tests/unit/server/integrations/printify-connector.test.ts
npx vitest run tests/unit/server/integrations/printful-connector.test.ts

# Run with coverage
npx vitest run tests/unit/server/integrations/ --coverage

# Watch mode
npx vitest tests/unit/server/integrations/ --watch
```

## Notes

- All tests use proper isolation with `vi.mock`
- Database connections are properly mocked with connection status
- HTTP requests use global fetch mocking
- Retry logic is simplified in tests (no actual retries) for faster execution
- Circuit breakers are mocked to always execute
- Tests cover both happy paths and error scenarios
- Rate limiting is tested without actual delays
