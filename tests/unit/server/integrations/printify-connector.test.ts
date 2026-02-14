import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PrintifyCredentials, PrintifyOAuthConfig, PrintifyProduct, PrintifyOrder } from "../../../../server/integrations/printify-connector";

// Mock dependencies
vi.mock("../../../../server/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../../server/lib/observability", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  })),
  withRetry: vi.fn((fn: any) => fn()),
  CircuitBreaker: class MockCircuitBreaker {
    execute(fn: any) {
      return fn();
    }
  },
  recordMetric: vi.fn(),
  trackError: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

describe("PrintifyConnector", () => {
  let printifyConnector: any;
  let mockDb: any;
  let mockFetch: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    // Get mock references
    const dbModule = await import("../../../../server/db");
    mockDb = dbModule.db;

    mockFetch = global.fetch as any;

    // Mock db query chains
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    // Import connector after mocks are set up
    const connectorModule = await import("../../../../server/integrations/printify-connector");
    printifyConnector = connectorModule.printifyConnector;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to setup mock connection
  function setupMockConnection(credentials: PrintifyCredentials) {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              status: "connected",
              credentials: credentials,
              accessToken: null,
              refreshToken: null,
              tokenExpiry: null,
            },
          ]),
        }),
      }),
    });
  }
  // ============================================================================
  // OAUTH AUTHENTICATION TESTS
  // ============================================================================

  describe("OAuth Authentication", () => {
    const mockOAuthConfig: PrintifyOAuthConfig = {
      clientId: "test_client_id",
      clientSecret: "test_client_secret",
      redirectUri: "http://localhost/callback",
      state: "random_state_123",
    };

    describe("generateOAuthUrl", () => {
      it("should generate valid OAuth authorization URL", () => {
        const url = printifyConnector.generateOAuthUrl(mockOAuthConfig);

        expect(url).toContain("https://printify.com/app/oauth/authorize");
        expect(url).toContain(`client_id=${mockOAuthConfig.clientId}`);
        expect(url).toContain(`redirect_uri=${encodeURIComponent(mockOAuthConfig.redirectUri)}`);
        expect(url).toContain(`state=${mockOAuthConfig.state}`);
        expect(url).toContain("response_type=code");
      });

      it("should include required OAuth scopes", () => {
        const url = printifyConnector.generateOAuthUrl(mockOAuthConfig);

        expect(url).toContain("shops.read");
        expect(url).toContain("shops.write");
        expect(url).toContain("products.read");
        expect(url).toContain("products.write");
        expect(url).toContain("orders.read");
        expect(url).toContain("orders.write");
      });
    });

    describe("exchangeCodeForToken", () => {
      it("should successfully exchange authorization code for tokens", async () => {
        const mockTokenResponse = {
          access_token: "test_access_token",
          refresh_token: "test_refresh_token",
          expires_in: 3600,
          token_type: "Bearer",
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        });

        const result = await printifyConnector.exchangeCodeForToken(
          mockOAuthConfig,
          "auth_code_123"
        );

        expect(result).toEqual(mockTokenResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.printify.com/v1/oauth/token",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
        );

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody).toMatchObject({
          grant_type: "authorization_code",
          client_id: mockOAuthConfig.clientId,
          client_secret: mockOAuthConfig.clientSecret,
          redirect_uri: mockOAuthConfig.redirectUri,
          code: "auth_code_123",
        });
      });

      it("should handle OAuth token exchange failure", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: "invalid_grant",
            message: "Authorization code is invalid",
          }),
        });

        await expect(
          printifyConnector.exchangeCodeForToken(mockOAuthConfig, "invalid_code")
        ).rejects.toThrow("OAuth token exchange failed: invalid_grant");
      });

      it("should handle network errors during token exchange", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        await expect(
          printifyConnector.exchangeCodeForToken(mockOAuthConfig, "auth_code_123")
        ).rejects.toThrow("Network error");
      });
    });

    describe("refreshAccessToken", () => {
      it("should successfully refresh expired access token", async () => {
        const mockRefreshResponse = {
          access_token: "new_access_token",
          refresh_token: "new_refresh_token",
          expires_in: 3600,
          token_type: "Bearer",
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockRefreshResponse,
        });

        const config = {
          clientId: mockOAuthConfig.clientId,
          clientSecret: mockOAuthConfig.clientSecret,
        };

        const result = await printifyConnector.refreshAccessToken(
          config,
          "old_refresh_token"
        );

        expect(result).toEqual(mockRefreshResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          "https://api.printify.com/v1/oauth/token",
          expect.objectContaining({
            method: "POST",
          })
        );

        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.grant_type).toBe("refresh_token");
        expect(callBody.refresh_token).toBe("old_refresh_token");
      });

      it("should handle refresh token failure", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: "invalid_grant",
            message: "Refresh token expired",
          }),
        });

        const config = {
          clientId: mockOAuthConfig.clientId,
          clientSecret: mockOAuthConfig.clientSecret,
        };

        await expect(
          printifyConnector.refreshAccessToken(config, "expired_token")
        ).rejects.toThrow("OAuth token refresh failed: invalid_grant");
      });
    });
  });

  // ============================================================================
  // PRODUCT MANAGEMENT TESTS
  // ============================================================================

  describe("Product Management", () => {
    const mockCredentials: PrintifyCredentials = {
      apiKey: "test_api_key",
      shopId: "shop_123",
    };

    beforeEach(() => {
      setupMockConnection(mockCredentials);
    });

    describe("createProduct", () => {
      it("should successfully create a product", async () => {
        const mockProduct: PrintifyProduct = {
          title: "Test T-Shirt",
          description: "A great t-shirt",
          blueprintId: 123,
          printProviderId: 456,
          variants: [
            {
              price: 1999,
              isEnabled: true,
            },
          ],
          images: [
            {
              src: "https://example.com/image.png",
              position: "front",
            },
          ],
        };

        const mockResponse = {
          id: "prod_789",
          ...mockProduct,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await printifyConnector.createProduct(mockProduct);

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/shops/shop_123/products.json"),
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              Authorization: "Bearer test_api_key",
            }),
          })
        );
      });

      it("should handle validation errors when creating product", async () => {
        const invalidProduct = {
          title: "Test",
          blueprintId: 123,
          printProviderId: 456,
          variants: [],
          images: [],
        } as PrintifyProduct;

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            message: "Variants are required",
            code: "VALIDATION_ERROR",
          }),
        });

        await expect(
          printifyConnector.createProduct(invalidProduct)
        ).rejects.toThrow("Variants are required");
      });

      it("should handle authentication errors", async () => {
        const mockProduct: PrintifyProduct = {
          title: "Test",
          description: "Test",
          blueprintId: 123,
          printProviderId: 456,
          variants: [],
          images: [],
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({
            message: "Invalid API key",
            code: "UNAUTHORIZED",
          }),
        });

        await expect(
          printifyConnector.createProduct(mockProduct)
        ).rejects.toThrow("Invalid API key");
      });
    });

    describe("updateProduct", () => {
      it("should successfully update a product", async () => {
        const updates = {
          title: "Updated T-Shirt",
          description: "Updated description",
        };

        const mockResponse = {
          id: "prod_789",
          ...updates,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await printifyConnector.updateProduct("prod_789", updates);

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/products/prod_789.json"),
          expect.objectContaining({
            method: "PUT",
          })
        );
      });

      it("should handle product not found error", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({
            message: "Product not found",
            code: "NOT_FOUND",
          }),
        });

        await expect(
          printifyConnector.updateProduct("nonexistent", { title: "Test" })
        ).rejects.toThrow("Product not found");
      });
    });

    describe("deleteProduct", () => {
      it("should successfully delete a product", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

        await printifyConnector.deleteProduct("prod_789");

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/products/prod_789.json"),
          expect.objectContaining({
            method: "DELETE",
          })
        );
      });

      it("should handle delete errors gracefully", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            message: "Internal server error",
          }),
        });

        await expect(
          printifyConnector.deleteProduct("prod_789")
        ).rejects.toThrow("Internal server error");
      });
    });

    describe("listProducts", () => {
      it("should list all products with pagination", async () => {
        const mockProducts = [
          { id: "prod_1", title: "Product 1" },
          { id: "prod_2", title: "Product 2" },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: mockProducts,
            current_page: 1,
            total: 2,
          }),
        });

        const result = await printifyConnector.listProducts(1, 100);

        expect(result.data).toEqual(mockProducts);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("?page=1&limit=100"),
          expect.any(Object)
        );
      });
    });
  });

  // ============================================================================
  // IMAGE UPLOAD TESTS
  // ============================================================================

  describe("Image Upload", () => {
    const mockCredentials: PrintifyCredentials = {
      apiKey: "test_api_key",
      shopId: "shop_123",
    };

    beforeEach(() => {
      setupMockConnection(mockCredentials);
    });

    it("should successfully upload an image", async () => {
      const mockResponse = {
        id: "img_123",
        preview_url: "https://cdn.printify.com/images/uploaded.png",
        file_name: "test.png",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await printifyConnector.uploadImage(
        "https://example.com/image.png",
        "test.png"
      );

      expect(result).toEqual({
        id: "img_123",
        url: "https://cdn.printify.com/images/uploaded.png",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/uploads/images.json"),
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should handle image upload failures", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: "Invalid image format",
          code: "INVALID_IMAGE",
        }),
      });

      await expect(
        printifyConnector.uploadImage("https://example.com/invalid.txt", "test.txt")
      ).rejects.toThrow("Invalid image format");
    });

    it("should handle large file size errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: async () => ({
          message: "File too large",
          code: "FILE_TOO_LARGE",
        }),
      });

      await expect(
        printifyConnector.uploadImage("https://example.com/large.png", "large.png")
      ).rejects.toThrow("File too large");
    });
  });

  // ============================================================================
  // BLUEPRINT AND PROVIDER TESTS
  // ============================================================================

  describe("Blueprints and Providers", () => {
    const mockCredentials: PrintifyCredentials = {
      apiKey: "test_api_key",
      shopId: "shop_123",
    };

    beforeEach(() => {
      setupMockConnection(mockCredentials);
    });

    describe("getBlueprints", () => {
      it("should fetch all available blueprints", async () => {
        const mockBlueprints = [
          {
            id: 1,
            title: "Unisex T-Shirt",
            description: "Classic unisex t-shirt",
            brand: "Bella+Canvas",
            model: "3001",
            images: ["https://example.com/blueprint1.png"],
          },
          {
            id: 2,
            title: "Mug",
            description: "11oz ceramic mug",
            brand: "Generic",
            model: "MUG-11",
            images: ["https://example.com/blueprint2.png"],
          },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockBlueprints,
        });

        const result = await printifyConnector.getBlueprints();

        expect(result).toEqual(mockBlueprints);
        expect(result).toHaveLength(2);
      });
    });

    describe("getPrintProviders", () => {
      it("should fetch print providers for a blueprint", async () => {
        const mockProviders = [
          {
            id: 99,
            title: "Provider A",
            location: "USA",
          },
          {
            id: 100,
            title: "Provider B",
            location: "EU",
          },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockProviders,
        });

        const result = await printifyConnector.getPrintProviders(1);

        expect(result).toEqual(mockProviders);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/catalog/blueprints/1/print_providers.json"),
          expect.any(Object)
        );
      });
    });

    describe("getVariants", () => {
      it("should fetch variants for a blueprint and provider", async () => {
        const mockVariants = [
          {
            id: 1001,
            title: "Small / Black",
            options: { size: "S", color: "Black" },
          },
          {
            id: 1002,
            title: "Medium / Black",
            options: { size: "M", color: "Black" },
          },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ variants: mockVariants }),
        });

        const result = await printifyConnector.getVariants(1, 99);

        expect(result).toEqual(mockVariants);
      });
    });
  });

  // ============================================================================
  // COST CALCULATION TESTS
  // ============================================================================

  describe("Cost Calculation", () => {
    const mockCredentials: PrintifyCredentials = {
      apiKey: "test_api_key",
      shopId: "shop_123",
    };

    beforeEach(() => {
      setupMockConnection(mockCredentials);
    });

    it("should calculate costs for product variants", async () => {
      // Mock getVariants response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          variants: [
            {
              id: 1001,
              cost: 89900, // cents
              shipping_cost: 39900, // cents
            },
          ],
        }),
      });

      const result = await printifyConnector.calculateCosts(1, 99, 1001, 29.99);

      expect(result).toMatchObject({
        variantId: 1001,
        blueprintId: 1,
        printProviderId: 99,
        productionCost: expect.any(Number),
        shippingCost: expect.any(Number),
      });
      expect(result.productionCost).toBeCloseTo(899);
      expect(result.shippingCost).toBeCloseTo(399);
    });

    it("should handle cost calculation errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ variants: [] }), // Empty variants array
      });

      await expect(
        printifyConnector.calculateCosts(1, 99, 9999, 29.99)
      ).rejects.toThrow("Variant 9999 not found");
    });
  });

  // ============================================================================
  // ORDER CREATION TESTS
  // ============================================================================

  describe("Order Management", () => {
    const mockCredentials: PrintifyCredentials = {
      apiKey: "test_api_key",
      shopId: "shop_123",
    };

    beforeEach(() => {
      setupMockConnection(mockCredentials);
    });

    describe("createOrder", () => {
      it("should successfully create an order", async () => {
        const mockOrder: PrintifyOrder = {
          externalId: "order_123",
          lineItems: [
            {
              productId: "prod_789",
              variantId: 1001,
              quantity: 2,
            },
          ],
          shippingMethod: 1,
          sendShippingNotification: true,
          address: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "1234567890",
            country: "US",
            region: "CA",
            address1: "123 Main St",
            city: "Los Angeles",
            zip: "90001",
          },
        };

        const mockResponse = {
          id: "printify_order_456",
          ...mockOrder,
          status: "pending",
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await printifyConnector.createOrder(mockOrder);

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/shops/shop_123/orders.json"),
          expect.objectContaining({
            method: "POST",
          })
        );
      });

      it("should handle order creation validation errors", async () => {
        const invalidOrder = {
          externalId: "order_123",
          lineItems: [],
          shippingMethod: 1,
          sendShippingNotification: true,
          address: {} as any,
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            message: "Invalid order data",
            code: "VALIDATION_ERROR",
          }),
        });

        await expect(
          printifyConnector.createOrder(invalidOrder)
        ).rejects.toThrow("Invalid order data");
      });

      it("should handle insufficient inventory errors", async () => {
        const mockOrder: PrintifyOrder = {
          externalId: "order_123",
          lineItems: [
            {
              productId: "prod_789",
              variantId: 1001,
              quantity: 100,
            },
          ],
          shippingMethod: 1,
          sendShippingNotification: true,
          address: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phone: "1234567890",
            country: "US",
            region: "CA",
            address1: "123 Main St",
            city: "Los Angeles",
            zip: "90001",
          },
        };

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({
            message: "Insufficient inventory",
            code: "OUT_OF_STOCK",
          }),
        });

        await expect(
          printifyConnector.createOrder(mockOrder)
        ).rejects.toThrow("Insufficient inventory");
      });
    });

    describe("getOrder", () => {
      it("should fetch order details", async () => {
        const mockOrderDetails = {
          id: "printify_order_456",
          status: "fulfilled",
          shipments: [],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockOrderDetails,
        });

        const result = await printifyConnector.getOrder("printify_order_456");

        expect(result).toEqual(mockOrderDetails);
      });
    });

    describe("cancelOrder", () => {
      it("should cancel an order successfully", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: "canceled" }),
        });

        await printifyConnector.cancelOrder("printify_order_456");

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/orders/printify_order_456/cancel.json"),
          expect.any(Object)
        );
      });

      it("should handle cancel errors for fulfilled orders", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            message: "Cannot cancel fulfilled order",
          }),
        });

        await expect(
          printifyConnector.cancelOrder("printify_order_456")
        ).rejects.toThrow("Cannot cancel fulfilled order");
      });
    });
  });

  // ============================================================================
  // WEBHOOK TESTS
  // ============================================================================

  describe("Webhooks", () => {
    const mockCredentials: PrintifyCredentials = {
      apiKey: "test_api_key",
      shopId: "shop_123",
    };

    beforeEach(() => {
      setupMockConnection(mockCredentials);
    });

    describe("registerWebhook", () => {
      it("should register a webhook successfully", async () => {
        const mockResponse = {
          id: "webhook_123",
          secret: "webhook_secret_xyz",
          url: "https://example.com/webhooks/printify",
          topic: "order:created",
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await printifyConnector.registerWebhook(
          "https://example.com/webhooks/printify"
        );

        expect(result).toEqual(mockResponse);
        expect(mockDb.update).toHaveBeenCalled();
      });

      it("should handle webhook registration errors", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            message: "Invalid webhook URL",
          }),
        });

        await expect(
          printifyConnector.registerWebhook("invalid-url")
        ).rejects.toThrow("Invalid webhook URL");
      });
    });

    describe("handleWebhook", () => {
      it("should handle order created webhook", async () => {
        const mockEvent = {
          type: "order:created",
          id: "event_123",
          resource: {
            id: "order_456",
            status: "pending",
          },
        };

        await printifyConnector.handleWebhook(mockEvent);

        // Should not throw
        expect(true).toBe(true);
      });

      it("should handle order updated webhook", async () => {
        const mockEvent = {
          type: "order:updated",
          id: "event_124",
          resource: {
            id: "order_456",
            status: "processing",
          },
        };

        await printifyConnector.handleWebhook(mockEvent);

        expect(true).toBe(true);
      });

      it("should handle shipment created webhook", async () => {
        const mockEvent = {
          type: "order:shipment:created",
          id: "event_125",
          resource: {
            tracking_number: "TRACK123",
            carrier: "USPS",
          },
        };

        await printifyConnector.handleWebhook(mockEvent);

        expect(true).toBe(true);
      });

      it("should handle unknown webhook types gracefully", async () => {
        const mockEvent = {
          type: "unknown:event",
          id: "event_999",
          resource: {},
        };

        await printifyConnector.handleWebhook(mockEvent);

        expect(true).toBe(true);
      });
    });
  });

  // ============================================================================
  // RATE LIMITING TESTS
  // ============================================================================

  describe("Rate Limiting", () => {
    const mockCredentials: PrintifyCredentials = {
      apiKey: "test_api_key",
      shopId: "shop_123",
    };

    beforeEach(() => {
      setupMockConnection(mockCredentials);
    });

    it("should handle 429 rate limit responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          message: "Rate limit exceeded",
          code: "RATE_LIMIT",
        }),
      });

      // Since withRetry is mocked to not actually retry, this should throw
      await expect(printifyConnector.listProducts()).rejects.toThrow("Rate limit exceeded");
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe("Error Handling", () => {
    const mockCredentials: PrintifyCredentials = {
      apiKey: "test_api_key",
      shopId: "shop_123",
    };

    beforeEach(() => {
      setupMockConnection(mockCredentials);
    });

    it("should handle 401 unauthorized errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        }),
      });

      await expect(printifyConnector.listProducts()).rejects.toThrow("Unauthorized");
    });

    it("should handle 500 internal server errors with retry", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          message: "Internal server error",
        }),
      });

      // Since withRetry is mocked to not actually retry, this should throw
      await expect(printifyConnector.listProducts()).rejects.toThrow("Internal server error");
    });

    it("should handle network timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      (timeoutError as any).code = "ETIMEDOUT";

      mockFetch.mockRejectedValueOnce(timeoutError);

      // Since withRetry is mocked to not actually retry, this should throw
      await expect(printifyConnector.listProducts()).rejects.toThrow("Request timeout");
    });

    it("should handle connection reset errors", async () => {
      const resetError = new Error("Connection reset");
      (resetError as any).code = "ECONNRESET";

      mockFetch.mockRejectedValueOnce(resetError);

      // Since withRetry is mocked to not actually retry, this should throw
      await expect(printifyConnector.listProducts()).rejects.toThrow("Connection reset");
    });
  });

  // ============================================================================
  // CONNECTION TEST
  // ============================================================================

  describe("Connection Testing", () => {
    beforeEach(() => {
      // Ensure mockFetch is clean for these tests
      mockFetch.mockClear();
    });

    it("should test connection successfully with valid credentials", async () => {
      const validCredentials: PrintifyCredentials = {
        apiKey: "valid_key",
        shopId: "shop_123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "shop_123",
          title: "My Shop",
        }),
      });

      const result = await printifyConnector.testConnection(validCredentials);

      expect(result.success).toBe(true);
      expect(result.message).toContain("Connected to shop");
    });

    it("should fail connection test with invalid credentials", async () => {
      const invalidCredentials: PrintifyCredentials = {
        apiKey: "invalid_key",
        shopId: "shop_123",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          message: "Invalid API key",
        }),
      });

      const result = await printifyConnector.testConnection(invalidCredentials);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid API key");
    });
  });
});
