import React from "react";
import { render } from "@testing-library/react-native";
import LoadingScreen from "../../src/presentation/components/legacy/LoadingScreen";
import { lightTheme, darkTheme } from "../../src/domain/contexts/ThemeContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock the useTheme hook
const mockUseTheme = jest.fn();
jest.mock("../../src/domain/contexts/ThemeContext", () => {
  const originalModule = jest.requireActual("../../src/domain/contexts/ThemeContext");
  return {
    ...originalModule,
    useTheme: () => mockUseTheme(),
  };
});

// Test wrapper component
const TestWrapper = ({ children, theme = "light" }) => {
  const selectedTheme = theme === "light" ? lightTheme : darkTheme;
  mockUseTheme.mockReturnValue({
    theme: selectedTheme,
    isDarkMode: theme === "dark",
    toggleTheme: jest.fn(),
    isLoading: false,
  });

  return <>{children}</>;
};

describe("LoadingScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default message", () => {
      const { getByText } = render(
        <TestWrapper>
          <LoadingScreen />
        </TestWrapper>
      );

      expect(getByText("Carregando...")).toBeTruthy();
    });

    it("renders with custom message", () => {
      const { getByText } = render(
        <TestWrapper>
          <LoadingScreen message="Aguarde um momento..." />
        </TestWrapper>
      );

      expect(getByText("Aguarde um momento...")).toBeTruthy();
    });

    it("displays activity indicator", () => {
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <LoadingScreen />
        </TestWrapper>
      );

      const ActivityIndicator = require("react-native").ActivityIndicator;
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });
  });

  describe("Theme Support", () => {
    it("renders correctly with light theme", () => {
      const { getByText } = render(
        <TestWrapper theme="light">
          <LoadingScreen message="Light theme" />
        </TestWrapper>
      );

      expect(getByText("Light theme")).toBeTruthy();
    });

    it("renders correctly with dark theme", () => {
      const { getByText } = render(
        <TestWrapper theme="dark">
          <LoadingScreen message="Dark theme" />
        </TestWrapper>
      );

      expect(getByText("Dark theme")).toBeTruthy();
    });
  });

  describe("ActivityIndicator Props", () => {
    it("uses large size for activity indicator", () => {
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <LoadingScreen />
        </TestWrapper>
      );

      const ActivityIndicator = require("react-native").ActivityIndicator;
      const indicator = UNSAFE_getByType(ActivityIndicator);
      expect(indicator.props.size).toBe("large");
    });
  });
});
