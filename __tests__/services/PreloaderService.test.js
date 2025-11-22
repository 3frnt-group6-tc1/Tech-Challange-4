import { PreloaderService } from "../../src/infrastructure/services/PreloaderService";
import firestoreService from "../../services/firestoreService";

// Mock firestoreService
jest.mock("../../services/firestoreService");

describe("PreloaderService", () => {
  const mockUserId = "test-user-123";
  const mockTransactions = [
    { id: "1", amount: 100, description: "Transaction 1" },
    { id: "2", amount: 200, description: "Transaction 2" },
  ];
  const mockCategories = [
    { id: "cat1", name: "Food" },
    { id: "cat2", name: "Transport" },
  ];
  const mockRecurringTransactions = [
    { id: "rec1", amount: 50, frequency: "monthly" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock all firestoreService methods
    firestoreService.getUserTransactions = jest.fn();
    firestoreService.getUserCategories = jest.fn();
    firestoreService.getUserRecurringTransactions = jest.fn();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe("preloadCriticalData", () => {
    it("should return error when no userId is provided", async () => {
      const result = await PreloaderService.preloadCriticalData(null);

      expect(result).toEqual({
        success: false,
        error: "No userId provided",
        results: [],
      });
      expect(console.warn).toHaveBeenCalledWith(
        "PreloaderService: No userId provided"
      );
    });

    it("should successfully preload all data when all requests succeed", async () => {
      firestoreService.getUserTransactions.mockResolvedValue(mockTransactions);
      firestoreService.getUserCategories.mockResolvedValue(mockCategories);
      firestoreService.getUserRecurringTransactions.mockResolvedValue(
        mockRecurringTransactions
      );

      const result = await PreloaderService.preloadCriticalData(mockUserId);

      expect(result.success).toBe(true);
      expect(result.summary.total).toBe(3);
      expect(result.summary.successful).toBe(3);
      expect(result.summary.failed).toBe(0);
      expect(result.loadTime).toBeGreaterThanOrEqual(0);
      expect(result.results).toHaveLength(3);

      // Verify each operation result
      expect(result.results[0]).toMatchObject({
        name: "transactions",
        status: "fulfilled",
        data: {
          type: "transactions",
          count: 2,
          data: mockTransactions,
        },
      });

      expect(result.results[1]).toMatchObject({
        name: "categories",
        status: "fulfilled",
        data: {
          type: "categories",
          data: mockCategories,
        },
      });

      expect(result.results[2]).toMatchObject({
        name: "recurringTransactions",
        status: "fulfilled",
        data: {
          type: "recurringTransactions",
          count: 1,
          data: mockRecurringTransactions,
        },
      });

      // Verify all firestore service methods were called
      expect(firestoreService.getUserTransactions).toHaveBeenCalledWith(
        mockUserId
      );
      expect(firestoreService.getUserCategories).toHaveBeenCalledWith(
        mockUserId
      );
      expect(
        firestoreService.getUserRecurringTransactions
      ).toHaveBeenCalledWith(mockUserId);
    });

    it("should handle partial failures gracefully", async () => {
      const transactionError = new Error("Failed to load transactions");
      const categoryError = new Error("Failed to load categories");

      firestoreService.getUserTransactions.mockRejectedValue(transactionError);
      firestoreService.getUserCategories.mockRejectedValue(categoryError);
      firestoreService.getUserRecurringTransactions.mockResolvedValue(
        mockRecurringTransactions
      );

      const result = await PreloaderService.preloadCriticalData(mockUserId);

      expect(result.success).toBe(true);
      expect(result.summary.total).toBe(3);
      expect(result.summary.successful).toBe(1);
      expect(result.summary.failed).toBe(2);

      // Verify failed operations
      expect(result.results[0]).toMatchObject({
        name: "transactions",
        status: "rejected",
        data: null,
        error: transactionError,
      });

      expect(result.results[1]).toMatchObject({
        name: "categories",
        status: "rejected",
        data: null,
        error: categoryError,
      });

      // Verify successful operations
      expect(result.results[2]).toMatchObject({
        name: "recurringTransactions",
        status: "fulfilled",
      });
    });

    it("should handle all requests failing", async () => {
      const error = new Error("Network error");
      firestoreService.getUserTransactions.mockRejectedValue(error);
      firestoreService.getUserCategories.mockRejectedValue(error);
      firestoreService.getUserRecurringTransactions.mockRejectedValue(error);

      const result = await PreloaderService.preloadCriticalData(mockUserId);

      expect(result.success).toBe(true);
      expect(result.summary.successful).toBe(0);
      expect(result.summary.failed).toBe(3);
      expect(result.results.every((r) => r.status === "rejected")).toBe(true);
    });

    it("should log performance metrics", async () => {
      firestoreService.getUserTransactions.mockResolvedValue(mockTransactions);
      firestoreService.getUserCategories.mockResolvedValue(mockCategories);
      firestoreService.getUserRecurringTransactions.mockResolvedValue(
        mockRecurringTransactions
      );

      await PreloaderService.preloadCriticalData(mockUserId);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("PreloaderService: Data preloaded in")
      );
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("ms"));
    });

    it("should handle empty data arrays", async () => {
      firestoreService.getUserTransactions.mockResolvedValue([]);
      firestoreService.getUserCategories.mockResolvedValue([]);
      firestoreService.getUserRecurringTransactions.mockResolvedValue([]);

      const result = await PreloaderService.preloadCriticalData(mockUserId);

      expect(result.success).toBe(true);
      expect(result.summary.successful).toBe(3);
      expect(result.results[0].data.count).toBe(0);
      expect(result.results[2].data.count).toBe(0);
    });
  });

  describe("getOperationName", () => {
    it("should return correct operation names for valid indices", () => {
      expect(PreloaderService.getOperationName(0)).toBe("transactions");
      expect(PreloaderService.getOperationName(1)).toBe("categories");
      expect(PreloaderService.getOperationName(2)).toBe(
        "recurringTransactions"
      );
    });

    it("should return 'unknown' for invalid indices", () => {
      expect(PreloaderService.getOperationName(3)).toBe("unknown");
      expect(PreloaderService.getOperationName(-1)).toBe("unknown");
      expect(PreloaderService.getOperationName(999)).toBe("unknown");
    });
  });

  describe("preloadTransactions", () => {
    it("should successfully load transactions", async () => {
      firestoreService.getUserTransactions.mockResolvedValue(mockTransactions);

      const result = await PreloaderService.preloadTransactions(mockUserId);

      expect(result).toEqual({
        type: "transactions",
        count: mockTransactions.length,
        data: mockTransactions,
      });
      expect(firestoreService.getUserTransactions).toHaveBeenCalledWith(
        mockUserId
      );
      expect(console.log).toHaveBeenCalledWith(
        `PreloaderService: Loaded ${mockTransactions.length} transactions`
      );
    });

    it("should throw error when loading transactions fails", async () => {
      const error = new Error("Failed to load transactions");
      firestoreService.getUserTransactions.mockRejectedValue(error);

      await expect(
        PreloaderService.preloadTransactions(mockUserId)
      ).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith(
        "PreloaderService: Error loading transactions",
        error
      );
    });
  });

  describe("preloadCategories", () => {
    it("should successfully load categories", async () => {
      firestoreService.getUserCategories.mockResolvedValue(mockCategories);

      const result = await PreloaderService.preloadCategories(mockUserId);

      expect(result).toEqual({
        type: "categories",
        data: mockCategories,
      });
      expect(firestoreService.getUserCategories).toHaveBeenCalledWith(
        mockUserId
      );
      expect(console.log).toHaveBeenCalledWith(
        "PreloaderService: Loaded categories"
      );
    });

    it("should throw error when loading categories fails", async () => {
      const error = new Error("Failed to load categories");
      firestoreService.getUserCategories.mockRejectedValue(error);

      await expect(
        PreloaderService.preloadCategories(mockUserId)
      ).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith(
        "PreloaderService: Error loading categories",
        error
      );
    });
  });

  describe("preloadRecurringTransactions", () => {
    it("should successfully load recurring transactions", async () => {
      firestoreService.getUserRecurringTransactions.mockResolvedValue(
        mockRecurringTransactions
      );

      const result = await PreloaderService.preloadRecurringTransactions(
        mockUserId
      );

      expect(result).toEqual({
        type: "recurringTransactions",
        count: mockRecurringTransactions.length,
        data: mockRecurringTransactions,
      });
      expect(
        firestoreService.getUserRecurringTransactions
      ).toHaveBeenCalledWith(mockUserId);
      expect(console.log).toHaveBeenCalledWith(
        `PreloaderService: Loaded ${mockRecurringTransactions.length} recurring transactions`
      );
    });

    it("should throw error when loading recurring transactions fails", async () => {
      const error = new Error("Failed to load recurring transactions");
      firestoreService.getUserRecurringTransactions.mockRejectedValue(error);

      await expect(
        PreloaderService.preloadRecurringTransactions(mockUserId)
      ).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith(
        "PreloaderService: Error loading recurring transactions",
        error
      );
    });
  });

  describe("preloadSpecificData", () => {
    it("should return error when userId is not provided", async () => {
      const result = await PreloaderService.preloadSpecificData(null, [
        "transactions",
      ]);

      expect(result).toEqual({
        success: false,
        error: "Invalid userId or dataTypes",
      });
    });

    it("should return error when dataTypes is not an array", async () => {
      const result = await PreloaderService.preloadSpecificData(
        mockUserId,
        "transactions"
      );

      expect(result).toEqual({
        success: false,
        error: "Invalid userId or dataTypes",
      });
    });

    it("should return error when dataTypes is empty", async () => {
      const result = await PreloaderService.preloadSpecificData(mockUserId, []);

      expect(result).toEqual({
        success: false,
        error: "Invalid userId or dataTypes",
      });
    });

    it("should load specific transactions data", async () => {
      firestoreService.getUserTransactions.mockResolvedValue(mockTransactions);

      const result = await PreloaderService.preloadSpecificData(mockUserId, [
        "transactions",
      ]);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        name: "transactions",
        status: "fulfilled",
        data: {
          type: "transactions",
          count: mockTransactions.length,
          data: mockTransactions,
        },
      });
    });

    it("should load specific categories data", async () => {
      firestoreService.getUserCategories.mockResolvedValue(mockCategories);

      const result = await PreloaderService.preloadSpecificData(mockUserId, [
        "categories",
      ]);

      expect(result.success).toBe(true);
      expect(result.results[0]).toMatchObject({
        name: "categories",
        status: "fulfilled",
      });
    });

    it("should load specific recurring transactions data", async () => {
      firestoreService.getUserRecurringTransactions.mockResolvedValue(
        mockRecurringTransactions
      );

      const result = await PreloaderService.preloadSpecificData(mockUserId, [
        "recurringTransactions",
      ]);

      expect(result.success).toBe(true);
      expect(result.results[0]).toMatchObject({
        name: "recurringTransactions",
        status: "fulfilled",
      });
    });

    it("should load multiple specific data types", async () => {
      firestoreService.getUserTransactions.mockResolvedValue(mockTransactions);
      firestoreService.getUserCategories.mockResolvedValue(mockCategories);

      const result = await PreloaderService.preloadSpecificData(mockUserId, [
        "transactions",
        "categories",
      ]);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].name).toBe("transactions");
      expect(result.results[1].name).toBe("categories");
      expect(result.results[0].status).toBe("fulfilled");
      expect(result.results[1].status).toBe("fulfilled");
    });

    it("should handle unknown data types gracefully", async () => {
      const result = await PreloaderService.preloadSpecificData(mockUserId, [
        "unknownType",
      ]);

      expect(result.success).toBe(true);
      expect(result.results[0]).toMatchObject({
        name: "unknownType",
        status: "rejected",
        error: new Error("Unknown data type: unknownType"),
      });
    });

    it("should handle mix of valid and invalid data types", async () => {
      firestoreService.getUserTransactions.mockResolvedValue(mockTransactions);

      const result = await PreloaderService.preloadSpecificData(mockUserId, [
        "transactions",
        "invalidType",
        "categories",
      ]);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(3);
      expect(result.results[0].status).toBe("fulfilled");
      expect(result.results[1].status).toBe("rejected");
      expect(result.results[2].status).toBe("fulfilled");
    });

    it("should handle failures in specific data loading", async () => {
      const error = new Error("Failed to load");
      firestoreService.getUserTransactions.mockRejectedValue(error);
      firestoreService.getUserCategories.mockResolvedValue(mockCategories);

      const result = await PreloaderService.preloadSpecificData(mockUserId, [
        "transactions",
        "categories",
      ]);

      expect(result.success).toBe(true);
      expect(result.results[0]).toMatchObject({
        name: "transactions",
        status: "rejected",
        error: error,
      });
      expect(result.results[1]).toMatchObject({
        name: "categories",
        status: "fulfilled",
      });
    });
  });

  describe("clearPreloadedData", () => {
    it("should log message when clearing preloaded data", () => {
      PreloaderService.clearPreloadedData();

      expect(console.log).toHaveBeenCalledWith(
        "PreloaderService: Clearing preloaded data"
      );
    });

    it("should not throw any errors", () => {
      expect(() => PreloaderService.clearPreloadedData()).not.toThrow();
    });
  });

  describe("Integration Tests", () => {
    it("should handle concurrent preload requests", async () => {
      firestoreService.getUserTransactions.mockResolvedValue(mockTransactions);
      firestoreService.getUserCategories.mockResolvedValue(mockCategories);
      firestoreService.getUserRecurringTransactions.mockResolvedValue(
        mockRecurringTransactions
      );

      const results = await Promise.all([
        PreloaderService.preloadCriticalData(mockUserId),
        PreloaderService.preloadCriticalData(mockUserId),
        PreloaderService.preloadCriticalData(mockUserId),
      ]);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.summary.successful).toBe(3);
      });
    });

    it("should maintain performance with large datasets", async () => {
      const largeTransactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `trans-${i}`,
        amount: Math.random() * 1000,
      }));

      firestoreService.getUserTransactions.mockResolvedValue(largeTransactions);
      firestoreService.getUserCategories.mockResolvedValue(mockCategories);
      firestoreService.getUserRecurringTransactions.mockResolvedValue(
        mockRecurringTransactions
      );

      const startTime = Date.now();
      const result = await PreloaderService.preloadCriticalData(mockUserId);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.results[0].data.count).toBe(1000);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
