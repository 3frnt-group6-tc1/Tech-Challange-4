import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../../components/Button";
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

describe("Button Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default props", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Click Me" onPress={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Click Me")).toBeTruthy();
    });

    it("renders with custom title", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Custom Button" onPress={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Custom Button")).toBeTruthy();
    });
  });

  describe("Variants", () => {
    it("renders primary variant correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Primary" variant="primary" onPress={jest.fn()} />
        </TestWrapper>
      );

      const button = getByText("Primary");
      expect(button).toBeTruthy();
    });

    it("renders secondary variant correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Secondary" variant="secondary" onPress={jest.fn()} />
        </TestWrapper>
      );

      const button = getByText("Secondary");
      expect(button).toBeTruthy();
    });

    it("renders danger variant correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Danger" variant="danger" onPress={jest.fn()} />
        </TestWrapper>
      );

      const button = getByText("Danger");
      expect(button).toBeTruthy();
    });

    it("renders success variant correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Success" variant="success" onPress={jest.fn()} />
        </TestWrapper>
      );

      const button = getByText("Success");
      expect(button).toBeTruthy();
    });
  });

  describe("Sizes", () => {
    it("renders small size correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Small" size="sm" onPress={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Small")).toBeTruthy();
    });

    it("renders medium size correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Medium" size="md" onPress={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Medium")).toBeTruthy();
    });

    it("renders large size correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <Button title="Large" size="lg" onPress={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Large")).toBeTruthy();
    });
  });

  describe("Interaction", () => {
    it("calls onPress when pressed", () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Button title="Press Me" onPress={onPressMock} />
        </TestWrapper>
      );

      fireEvent.press(getByText("Press Me"));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it("does not call onPress when disabled", () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Button title="Disabled" onPress={onPressMock} disabled={true} />
        </TestWrapper>
      );

      fireEvent.press(getByText("Disabled"));
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it("does not call onPress when loading", () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <TestWrapper>
          <Button title="Loading" onPress={onPressMock} loading={true} />
        </TestWrapper>
      );

      fireEvent.press(getByText("Loading"));
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("displays loading indicator when loading is true", () => {
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <Button title="Loading" onPress={jest.fn()} loading={true} />
        </TestWrapper>
      );

      const ActivityIndicator = require("react-native").ActivityIndicator;
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it("does not display loading indicator when loading is false", () => {
      const { UNSAFE_queryByType } = render(
        <TestWrapper>
          <Button title="Not Loading" onPress={jest.fn()} loading={false} />
        </TestWrapper>
      );

      const ActivityIndicator = require("react-native").ActivityIndicator;
      expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });
  });

  describe("Theme Support", () => {
    it("renders correctly with light theme", () => {
      const { getByText } = render(
        <TestWrapper theme="light">
          <Button title="Light Theme" onPress={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Light Theme")).toBeTruthy();
    });

    it("renders correctly with dark theme", () => {
      const { getByText } = render(
        <TestWrapper theme="dark">
          <Button title="Dark Theme" onPress={jest.fn()} />
        </TestWrapper>
      );

      expect(getByText("Dark Theme")).toBeTruthy();
    });
  });

  describe("Custom Styles", () => {
    it("applies custom button style", () => {
      const customStyle = { margin: 10 };
      const { getByText } = render(
        <TestWrapper>
          <Button
            title="Custom Style"
            onPress={jest.fn()}
            style={customStyle}
          />
        </TestWrapper>
      );

      expect(getByText("Custom Style")).toBeTruthy();
    });

    it("applies custom text style", () => {
      const customTextStyle = { fontSize: 20 };
      const { getByText } = render(
        <TestWrapper>
          <Button
            title="Custom Text"
            onPress={jest.fn()}
            textStyle={customTextStyle}
          />
        </TestWrapper>
      );

      expect(getByText("Custom Text")).toBeTruthy();
    });
  });
});
