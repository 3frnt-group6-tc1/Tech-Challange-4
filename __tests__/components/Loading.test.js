import React from "react";
import { render } from "@testing-library/react-native";
import { Loading } from "../../components/Loading";
import { lightTheme, darkTheme } from "../../contexts/ThemeContext";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock the useTheme hook
const mockUseTheme = jest.fn();
jest.mock("../../contexts/ThemeContext", () => {
  const originalModule = jest.requireActual("../../contexts/ThemeContext");
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

describe("Loading Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default message", () => {
      const { getByText } = render(
        <TestWrapper>
          <Loading />
        </TestWrapper>
      );

      expect(getByText("Carregando...")).toBeTruthy();
    });

    it("renders with custom message", () => {
      const { getByText } = render(
        <TestWrapper>
          <Loading message="Processando dados..." />
        </TestWrapper>
      );

      expect(getByText("Processando dados...")).toBeTruthy();
    });

    it("displays activity indicator", () => {
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <Loading />
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
          <Loading message="Light theme loading" />
        </TestWrapper>
      );

      expect(getByText("Light theme loading")).toBeTruthy();
    });

    it("renders correctly with dark theme", () => {
      const { getByText } = render(
        <TestWrapper theme="dark">
          <Loading message="Dark theme loading" />
        </TestWrapper>
      );

      expect(getByText("Dark theme loading")).toBeTruthy();
    });
  });

  describe("ActivityIndicator Props", () => {
    it("uses large size for activity indicator", () => {
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <Loading />
        </TestWrapper>
      );

      const ActivityIndicator = require("react-native").ActivityIndicator;
      const indicator = UNSAFE_getByType(ActivityIndicator);
      expect(indicator.props.size).toBe("large");
    });
  });
});
