import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CurrencyProvider, useCurrency } from "../../src/domain/contexts/CurrencyContext";
import { useAuth } from "../../src/domain/contexts/AuthContext";

// Mock dependencies
jest.mock("../../src/domain/contexts/AuthContext");
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("CurrencyContext", () => {
  const mockUser = { uid: "test-user-123" };

  const wrapper = ({ children }) => (
    <CurrencyProvider>{children}</CurrencyProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(null);
  });

  describe("Initialization", () => {
    it("should initialize with default currency when no user is logged in", async () => {
      useAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currency.code).toBe("BRL");
      expect(result.current.currency.symbol).toBe("R$");
    });

    it("should load saved currency settings for logged-in user", async () => {
      useAuth.mockReturnValue({ user: mockUser });
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          code: "USD",
          symbol: "$",
          name: "Dólar Americano",
          locale: "en-US",
        })
      );

      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currency.code).toBe("USD");
      expect(result.current.currency.symbol).toBe("$");
    });

    it("should use default currency if saved currency is invalid", async () => {
      useAuth.mockReturnValue({ user: mockUser });
      AsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ code: "INVALID", symbol: "X" })
      );

      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currency.code).toBe("BRL");
    });
  });

  describe("formatCurrency", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: null });
    });

    it("should format currency with BRL locale", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const formatted = result.current.formatCurrency(1234.56);
      expect(formatted).toContain("R$");
      expect(formatted).toContain("1.234,56");
    });

    it("should handle null and undefined values", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatCurrency(null)).toContain("0,00");
      expect(result.current.formatCurrency(undefined)).toContain("0,00");
    });

    it("should handle NaN values", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatCurrency(NaN)).toContain("0,00");
    });

    it("should always show two decimal places", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatCurrency(10)).toContain("10,00");
      expect(result.current.formatCurrency(10.5)).toContain("10,50");
    });
  });

  describe("formatCurrencyInput", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: null });
    });

    it("should format input value correctly", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatCurrencyInput("12345")).toContain("123,45");
      expect(result.current.formatCurrencyInput("R$ 123,45")).toContain(
        "123,45"
      );
    });

    it("should return empty string for empty input", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatCurrencyInput("")).toBe("");
      expect(result.current.formatCurrencyInput(null)).toBe("");
    });

    it("should handle only numeric characters", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const formatted = result.current.formatCurrencyInput("abc123def45");
      expect(formatted).toContain("123,45");
    });
  });

  describe("parseCurrency", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: null });
    });

    it("should parse formatted currency to numeric value", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.parseCurrency("R$ 123,45")).toBe("123.45");
      expect(result.current.parseCurrency("12345")).toBe("123.45");
    });

    it("should return empty string for empty input", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.parseCurrency("")).toBe("");
      expect(result.current.parseCurrency(null)).toBe("");
    });

    it("should always return value with 2 decimal places", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.parseCurrency("100")).toBe("1.00");
      expect(result.current.parseCurrency("1")).toBe("0.01");
    });
  });

  describe("formatAmountToDecimal", () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ user: null });
    });

    it("should format integer amounts to decimal with 2 places", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatAmountToDecimal(10)).toBe("10.00");
      expect(result.current.formatAmountToDecimal(100)).toBe("100.00");
      expect(result.current.formatAmountToDecimal(0)).toBe("0.00");
    });

    it("should format decimal amounts to 2 decimal places", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatAmountToDecimal(10.5)).toBe("10.50");
      expect(result.current.formatAmountToDecimal(10.567)).toBe("10.57");
      expect(result.current.formatAmountToDecimal(10.1)).toBe("10.10");
    });

    it("should handle string numeric values", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatAmountToDecimal("10")).toBe("10.00");
      expect(result.current.formatAmountToDecimal("10.5")).toBe("10.50");
      expect(result.current.formatAmountToDecimal("100.567")).toBe("100.57");
    });

    it("should return empty string for null, undefined, or empty string", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatAmountToDecimal(null)).toBe("");
      expect(result.current.formatAmountToDecimal(undefined)).toBe("");
      expect(result.current.formatAmountToDecimal("")).toBe("");
    });

    it("should return empty string for NaN values", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatAmountToDecimal(NaN)).toBe("");
      expect(result.current.formatAmountToDecimal("not a number")).toBe("");
      expect(result.current.formatAmountToDecimal("abc")).toBe("");
    });

    it("should handle negative amounts", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatAmountToDecimal(-10)).toBe("-10.00");
      expect(result.current.formatAmountToDecimal(-10.5)).toBe("-10.50");
    });

    it("should handle very large numbers", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatAmountToDecimal(999999.99)).toBe("999999.99");
      expect(result.current.formatAmountToDecimal(1000000)).toBe("1000000.00");
    });

    it("should round properly at midpoint", async () => {
      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatAmountToDecimal(10.125)).toBe("10.13");
      expect(result.current.formatAmountToDecimal(10.124)).toBe("10.12");
    });
  });

  describe("updateCurrency", () => {
    it("should update currency and save to AsyncStorage", async () => {
      useAuth.mockReturnValue({ user: mockUser });

      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newCurrency = {
        code: "EUR",
        symbol: "€",
        name: "Euro",
        locale: "de-DE",
      };

      await act(async () => {
        await result.current.updateCurrency(newCurrency);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `@currency_settings_${mockUser.uid}`,
        JSON.stringify(newCurrency)
      );
      expect(result.current.currency.code).toBe("EUR");
    });

    it("should handle AsyncStorage errors gracefully", async () => {
      useAuth.mockReturnValue({ user: mockUser });
      AsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));

      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newCurrency = {
        code: "EUR",
        symbol: "€",
        name: "Euro",
        locale: "de-DE",
      };

      await expect(
        act(async () => {
          await result.current.updateCurrency(newCurrency);
        })
      ).rejects.toThrow("Storage error");
    });
  });

  describe("currencies list", () => {
    it("should provide list of available currencies", async () => {
      useAuth.mockReturnValue({ user: null });

      const { result } = renderHook(() => useCurrency(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currencies).toHaveLength(10);
      expect(result.current.currencies[0].code).toBe("BRL");
      expect(result.current.currencies[1].code).toBe("USD");
    });
  });

  describe("Error handling", () => {
    it("should throw error when useCurrency is used outside provider", () => {
      // Temporarily suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useCurrency());
      }).toThrow("useCurrency deve ser usado dentro de um CurrencyProvider");

      console.error = originalError;
    });
  });
});
