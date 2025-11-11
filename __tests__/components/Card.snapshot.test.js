import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { Card } from "../../components/Card";

// Mock the useTheme hook with consistent values
jest.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        card: "#FFFFFF",
        shadow: "rgba(0, 0, 0, 0.1)",
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      borderRadius: {
        md: 12,
      },
    },
  }),
}));

describe("Card Component - Structure Tests", () => {
  it("should render with default props", () => {
    const { getByText } = render(
      <Card>
        <Text>Default Card</Text>
      </Card>
    );

    expect(getByText("Default Card")).toBeTruthy();
  });

  it("should render with custom padding", () => {
    const { getByText } = render(
      <Card padding="lg">
        <Text>Large Padding Card</Text>
      </Card>
    );

    expect(getByText("Large Padding Card")).toBeTruthy();
  });

  it("should render with custom margin", () => {
    const { getByText } = render(
      <Card margin="xl">
        <Text>Extra Large Margin Card</Text>
      </Card>
    );

    expect(getByText("Extra Large Margin Card")).toBeTruthy();
  });

  it("should render with custom styles", () => {
    const { getByText } = render(
      <Card style={{ backgroundColor: "red", borderWidth: 2 }}>
        <Text>Custom Styled Card</Text>
      </Card>
    );

    expect(getByText("Custom Styled Card")).toBeTruthy();
  });

  it("should render with all props combined", () => {
    const { getByText } = render(
      <Card
        padding="xs"
        margin="lg"
        style={{ opacity: 0.8, transform: [{ scale: 1.1 }] }}
      >
        <Text>All Props Card</Text>
      </Card>
    );

    expect(getByText("All Props Card")).toBeTruthy();
  });

  it("should render with no children", () => {
    const result = render(<Card />);

    // Card should still render even without children
    expect(result).toBeTruthy();
  });

  it("should render with multiple children", () => {
    const { getByText } = render(
      <Card>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </Card>
    );

    expect(getByText("First Child")).toBeTruthy();
    expect(getByText("Second Child")).toBeTruthy();
  });

  it("should render with nested cards", () => {
    const { getByText } = render(
      <Card padding="lg">
        <Text>Outer Card</Text>
        <Card padding="sm" margin="xs">
          <Text>Inner Card</Text>
        </Card>
      </Card>
    );

    expect(getByText("Outer Card")).toBeTruthy();
    expect(getByText("Inner Card")).toBeTruthy();
  });
});
