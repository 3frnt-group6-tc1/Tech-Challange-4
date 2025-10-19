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

describe("Card Component - Snapshot Tests", () => {
  it("should match snapshot with default props", () => {
    const tree = render(
      <Card>
        <Text>Default Card</Text>
      </Card>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with custom padding", () => {
    const tree = render(
      <Card padding="lg">
        <Text>Large Padding Card</Text>
      </Card>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with custom margin", () => {
    const tree = render(
      <Card margin="xl">
        <Text>Extra Large Margin Card</Text>
      </Card>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with custom styles", () => {
    const tree = render(
      <Card style={{ backgroundColor: "red", borderWidth: 2 }}>
        <Text>Custom Styled Card</Text>
      </Card>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with all props combined", () => {
    const tree = render(
      <Card
        padding="xs"
        margin="lg"
        style={{ opacity: 0.8, transform: [{ scale: 1.1 }] }}
      >
        <Text>All Props Card</Text>
      </Card>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with no children", () => {
    const tree = render(<Card />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with multiple children", () => {
    const tree = render(
      <Card>
        <Text>First Child</Text>
        <Text>Second Child</Text>
      </Card>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with nested cards", () => {
    const tree = render(
      <Card padding="lg">
        <Text>Outer Card</Text>
        <Card padding="sm" margin="xs">
          <Text>Inner Card</Text>
        </Card>
      </Card>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
