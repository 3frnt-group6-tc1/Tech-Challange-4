import firestoreService from "../../../services/firestoreService";

/**
 * PreloaderService
 * Handles pre-loading of critical application data to improve perceived performance
 * Uses Promise.allSettled to ensure all requests complete even if some fail
 */
export class PreloaderService {
  /**
   * Pre-load critical data for a user
   * @param {string} userId - The user's unique identifier
   * @returns {Promise<Object>} Results of all preload operations
   */
  static async preloadCriticalData(userId) {
    if (!userId) {
      console.warn("PreloaderService: No userId provided");
      return {
        success: false,
        error: "No userId provided",
        results: [],
      };
    }

    try {
      const startTime = Date.now();

      // Run all data fetches in parallel for faster loading
      const promises = [
        this.preloadTransactions(userId),
        this.preloadCategories(userId),
        this.preloadRecurringTransactions(userId),
      ];

      const results = await Promise.allSettled(promises);

      const loadTime = Date.now() - startTime;
      console.log(`PreloaderService: Data preloaded in ${loadTime}ms`);

      // Analyze results
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      return {
        success: true,
        loadTime,
        summary: {
          total: results.length,
          successful,
          failed,
        },
        results: results.map((result, index) => ({
          name: this.getOperationName(index),
          status: result.status,
          data: result.status === "fulfilled" ? result.value : null,
          error: result.status === "rejected" ? result.reason : null,
        })),
      };
    } catch (error) {
      console.error("PreloaderService: Critical error during preload", error);
      return {
        success: false,
        error: error.message,
        results: [],
      };
    }
  }

  /**
   * Get operation name by index
   * @private
   */
  static getOperationName(index) {
    const operations = ["transactions", "categories", "recurringTransactions"];
    return operations[index] || "unknown";
  }

  /**
   * Pre-load recent transactions
   * @private
   */
  static async preloadTransactions(userId) {
    try {
      const transactions = await firestoreService.getUserTransactions(userId);
      console.log(
        `PreloaderService: Loaded ${transactions.length} transactions`
      );
      return {
        type: "transactions",
        count: transactions.length,
        data: transactions,
      };
    } catch (error) {
      console.error("PreloaderService: Error loading transactions", error);
      throw error;
    }
  }

  /**
   * Pre-load user categories
   * @private
   */
  static async preloadCategories(userId) {
    try {
      const categories = await firestoreService.getUserCategories(userId);
      console.log("PreloaderService: Loaded categories");
      return {
        type: "categories",
        data: categories,
      };
    } catch (error) {
      console.error("PreloaderService: Error loading categories", error);
      throw error;
    }
  }

  /**
   * Pre-load recurring transactions
   * @private
   */
  static async preloadRecurringTransactions(userId) {
    try {
      const recurringTransactions =
        await firestoreService.getUserRecurringTransactions(userId);
      console.log(
        `PreloaderService: Loaded ${recurringTransactions.length} recurring transactions`
      );
      return {
        type: "recurringTransactions",
        count: recurringTransactions.length,
        data: recurringTransactions,
      };
    } catch (error) {
      console.error(
        "PreloaderService: Error loading recurring transactions",
        error
      );
      throw error;
    }
  }

  /**
   * Pre-load specific data sets
   * Useful for loading data on-demand for specific screens
   * @param {string} userId - The user's unique identifier
   * @param {Array<string>} dataTypes - Array of data types to preload
   * @returns {Promise<Object>} Results of preload operations
   */
  static async preloadSpecificData(userId, dataTypes = []) {
    if (!userId || !Array.isArray(dataTypes) || dataTypes.length === 0) {
      return {
        success: false,
        error: "Invalid userId or dataTypes",
      };
    }

    const promises = dataTypes.map((type) => {
      switch (type) {
        case "transactions":
          return this.preloadTransactions(userId);
        case "categories":
          return this.preloadCategories(userId);
        case "recurringTransactions":
          return this.preloadRecurringTransactions(userId);
        default:
          return Promise.reject(new Error(`Unknown data type: ${type}`));
      }
    });

    const results = await Promise.allSettled(promises);

    return {
      success: true,
      results: results.map((result, index) => ({
        name: dataTypes[index],
        status: result.status,
        data: result.status === "fulfilled" ? result.value : null,
        error: result.status === "rejected" ? result.reason : null,
      })),
    };
  }

  /**
   * Clear preloaded data from memory
   * Useful for memory management
   */
  static clearPreloadedData() {
    // This would be implemented if we were caching data in memory
    console.log("PreloaderService: Clearing preloaded data");
  }
}

export default PreloaderService;
