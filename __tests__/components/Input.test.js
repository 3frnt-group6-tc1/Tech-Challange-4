import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "../../components/Input";
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

describe("Input Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with basic props", () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input value="" onChangeText={jest.fn()} placeholder="Enter text" />
        </TestWrapper>
      );

      expect(getByPlaceholderText("Enter text")).toBeTruthy();
    });

    it("renders with label", () => {
      const { getByText } = render(
        <TestWrapper>
          <Input
            label="Username"
            value=""
            onChangeText={jest.fn()}
            placeholder="Enter username"
          />
        </TestWrapper>
      );

      expect(getByText("Username")).toBeTruthy();
    });

    it("renders without label when not provided", () => {
      const { queryByText } = render(
        <TestWrapper>
          <Input value="" onChangeText={jest.fn()} placeholder="Enter text" />
        </TestWrapper>
      );

      expect(queryByText("Username")).toBeNull();
    });

    it("displays the provided value", () => {
      const { getByDisplayValue } = render(
        <TestWrapper>
          <Input
            value="test value"
            onChangeText={jest.fn()}
            placeholder="Enter text"
          />
        </TestWrapper>
      );

      expect(getByDisplayValue("test value")).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("displays error message when error prop is provided", () => {
      const { getByText } = render(
        <TestWrapper>
          <Input
            value=""
            onChangeText={jest.fn()}
            error="This field is required"
          />
        </TestWrapper>
      );

      expect(getByText("This field is required")).toBeTruthy();
    });

    it("does not display error message when error prop is not provided", () => {
      const { queryByText } = render(
        <TestWrapper>
          <Input value="" onChangeText={jest.fn()} />
        </TestWrapper>
      );

      expect(queryByText("This field is required")).toBeNull();
    });
  });

  describe("Interaction", () => {
    it("calls onChangeText when text is entered", () => {
      const onChangeTextMock = jest.fn();
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input
            value=""
            onChangeText={onChangeTextMock}
            placeholder="Enter text"
          />
        </TestWrapper>
      );

      fireEvent.changeText(getByPlaceholderText("Enter text"), "new text");
      expect(onChangeTextMock).toHaveBeenCalledWith("new text");
    });

    it("handles multiple text changes", () => {
      const onChangeTextMock = jest.fn();
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input
            value=""
            onChangeText={onChangeTextMock}
            placeholder="Enter text"
          />
        </TestWrapper>
      );

      const input = getByPlaceholderText("Enter text");
      fireEvent.changeText(input, "first");
      fireEvent.changeText(input, "second");

      expect(onChangeTextMock).toHaveBeenCalledTimes(2);
      expect(onChangeTextMock).toHaveBeenNthCalledWith(1, "first");
      expect(onChangeTextMock).toHaveBeenNthCalledWith(2, "second");
    });
  });

  describe("Input Types", () => {
    it("renders as secure text entry when secureTextEntry is true", () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input
            value=""
            onChangeText={jest.fn()}
            placeholder="Enter password"
            secureTextEntry={true}
          />
        </TestWrapper>
      );

      const input = getByPlaceholderText("Enter password");
      expect(input.props.secureTextEntry).toBe(true);
    });

    it("renders with numeric keyboard type", () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input
            value=""
            onChangeText={jest.fn()}
            placeholder="Enter number"
            keyboardType="numeric"
          />
        </TestWrapper>
      );

      const input = getByPlaceholderText("Enter number");
      expect(input.props.keyboardType).toBe("numeric");
    });

    it("renders with email keyboard type", () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input
            value=""
            onChangeText={jest.fn()}
            placeholder="Enter email"
            keyboardType="email-address"
          />
        </TestWrapper>
      );

      const input = getByPlaceholderText("Enter email");
      expect(input.props.keyboardType).toBe("email-address");
    });
  });

  describe("Auto Capitalize", () => {
    it("applies none autoCapitalize setting", () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input
            value=""
            onChangeText={jest.fn()}
            placeholder="Enter text"
            autoCapitalize="none"
          />
        </TestWrapper>
      );

      const input = getByPlaceholderText("Enter text");
      expect(input.props.autoCapitalize).toBe("none");
    });

    it("applies default sentences autoCapitalize", () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input value="" onChangeText={jest.fn()} placeholder="Enter text" />
        </TestWrapper>
      );

      const input = getByPlaceholderText("Enter text");
      expect(input.props.autoCapitalize).toBe("sentences");
    });
  });

  describe("Theme Support", () => {
    it("renders correctly with light theme", () => {
      const { getByPlaceholderText } = render(
        <TestWrapper theme="light">
          <Input value="" onChangeText={jest.fn()} placeholder="Light theme" />
        </TestWrapper>
      );

      expect(getByPlaceholderText("Light theme")).toBeTruthy();
    });

    it("renders correctly with dark theme", () => {
      const { getByPlaceholderText } = render(
        <TestWrapper theme="dark">
          <Input value="" onChangeText={jest.fn()} placeholder="Dark theme" />
        </TestWrapper>
      );

      expect(getByPlaceholderText("Dark theme")).toBeTruthy();
    });
  });

  describe("Custom Styles", () => {
    it("applies custom input style", () => {
      const customStyle = { margin: 10 };
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <Input
            value=""
            onChangeText={jest.fn()}
            placeholder="Custom style"
            style={customStyle}
          />
        </TestWrapper>
      );

      expect(getByPlaceholderText("Custom style")).toBeTruthy();
    });
  });
});
