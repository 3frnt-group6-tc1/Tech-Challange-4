import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { Card } from "../../components/Card";
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
  // Set up the mock before rendering
  const selectedTheme = theme === "light" ? lightTheme : darkTheme;
  mockUseTheme.mockReturnValue({
    theme: selectedTheme,
    isDarkMode: theme === "dark",
    toggleTheme: jest.fn(),
    isLoading: false,
  });

  return <>{children}</>;
};

describe("Card Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with children", () => {
      const { getByText } = render(
        <TestWrapper>
          <Card>
            <Text>Test Content</Text>
          </Card>
        </TestWrapper>
      );

      expect(getByText("Test Content")).toBeDefined();
    });

    it("renders without children", () => {
      const { root } = render(
        <TestWrapper>
          <Card />
        </TestWrapper>
      );

      expect(root).toBeDefined();
    });

    it("renders with multiple children", () => {
      const { getByText } = render(
        <TestWrapper>
          <Card>
            <Text>First Child</Text>
            <Text>Second Child</Text>
          </Card>
        </TestWrapper>
      );

      expect(getByText("First Child")).toBeDefined();
      expect(getByText("Second Child")).toBeDefined();
    });
  });

  describe("Styling", () => {
    it("applies default padding and margin", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;

      // Check if styles array contains expected padding and margin values
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;
      expect(flattenedStyles.padding).toBe(lightTheme.spacing.md); // default padding='md'
      expect(flattenedStyles.margin).toBe(lightTheme.spacing.sm); // default margin='sm'
    });

    it("applies custom padding prop", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card" padding="lg">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.padding).toBe(lightTheme.spacing.lg);
    });

    it("applies custom margin prop", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card" margin="xl">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.margin).toBe(lightTheme.spacing.xl);
    });

    it("applies custom style prop", () => {
      const customStyle = { borderWidth: 2, opacity: 0.8 };

      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card" style={customStyle}>
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.borderWidth).toBe(2);
      expect(flattenedStyles.opacity).toBe(0.8);
    });

    it("applies theme-based background color", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.backgroundColor).toBe(lightTheme.colors.card);
    });

    it("applies theme-based border radius", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.borderRadius).toBe(lightTheme.borderRadius.md);
    });

    it("applies theme-based shadow color", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.shadowColor).toBe(lightTheme.colors.shadow);
    });

    it("includes shadow properties from StyleSheet", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.shadowOffset).toEqual({ width: 0, height: 2 });
      expect(flattenedStyles.shadowOpacity).toBe(0.1);
      expect(flattenedStyles.shadowRadius).toBe(8);
      expect(flattenedStyles.elevation).toBe(4);
    });
  });

  describe("Props Validation", () => {
    it("handles all spacing values for padding", () => {
      const spacingValues = ["xs", "sm", "md", "lg", "xl"];

      spacingValues.forEach((spacing) => {
        const { getByTestId } = render(
          <TestWrapper>
            <Card testID={`card-${spacing}`} padding={spacing}>
              <Text>Content</Text>
            </Card>
          </TestWrapper>
        );

        const card = getByTestId(`card-${spacing}`);
        const styles = card.props.style;
        const flattenedStyles = Array.isArray(styles)
          ? Object.assign({}, ...styles)
          : styles;

        expect(flattenedStyles.padding).toBe(lightTheme.spacing[spacing]);
      });
    });

    it("handles all spacing values for margin", () => {
      const spacingValues = ["xs", "sm", "md", "lg", "xl"];

      spacingValues.forEach((spacing) => {
        const { getByTestId } = render(
          <TestWrapper>
            <Card testID={`card-${spacing}`} margin={spacing}>
              <Text>Content</Text>
            </Card>
          </TestWrapper>
        );

        const card = getByTestId(`card-${spacing}`);
        const styles = card.props.style;
        const flattenedStyles = Array.isArray(styles)
          ? Object.assign({}, ...styles)
          : styles;

        expect(flattenedStyles.margin).toBe(lightTheme.spacing[spacing]);
      });
    });

    it("handles array of custom styles", () => {
      const customStyles = [
        { borderWidth: 1 },
        { backgroundColor: "red" },
        { opacity: 0.5 },
      ];

      const { getByTestId } = render(
        <TestWrapper>
          <Card testID="card" style={customStyles}>
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.borderWidth).toBe(1);
      expect(flattenedStyles.backgroundColor).toBe("red"); // Custom style should override theme
      expect(flattenedStyles.opacity).toBe(0.5);
    });
  });

  describe("Theme Integration", () => {
    it("works with light theme", () => {
      const { getByTestId } = render(
        <TestWrapper theme="light">
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.backgroundColor).toBe(lightTheme.colors.card);
      expect(flattenedStyles.shadowColor).toBe(lightTheme.colors.shadow);
    });

    it("works with dark theme", () => {
      const { getByTestId } = render(
        <TestWrapper theme="dark">
          <Card testID="card">
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.backgroundColor).toBe(darkTheme.colors.card);
      expect(flattenedStyles.shadowColor).toBe(darkTheme.colors.shadow);
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined children gracefully", () => {
      const { root } = render(
        <TestWrapper>
          <Card>{undefined}</Card>
        </TestWrapper>
      );

      expect(root).toBeDefined();
    });

    it("handles null children gracefully", () => {
      const { root } = render(
        <TestWrapper>
          <Card>{null}</Card>
        </TestWrapper>
      );

      expect(root).toBeDefined();
    });

    it("handles empty string children", () => {
      const { root } = render(
        <TestWrapper>
          <Card>
            <Text></Text>
          </Card>
        </TestWrapper>
      );

      expect(root).toBeDefined();
    });

    it("handles zero as a valid child", () => {
      const { getByText } = render(
        <TestWrapper>
          <Card>
            <Text>0</Text>
          </Card>
        </TestWrapper>
      );

      expect(getByText("0")).toBeDefined();
    });

    it("handles complex nested children", () => {
      const { getByText } = render(
        <TestWrapper>
          <Card>
            <Text>Parent</Text>
            <Card>
              <Text>Nested Card</Text>
            </Card>
          </Card>
        </TestWrapper>
      );

      expect(getByText("Parent")).toBeDefined();
      expect(getByText("Nested Card")).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("passes through accessibility props", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Card
            testID="card"
            accessible={true}
            accessibilityLabel="Test Card"
            accessibilityRole="button"
          >
            <Text>Content</Text>
          </Card>
        </TestWrapper>
      );

      const card = getByTestId("card");

      expect(card.props.accessible).toBe(true);
      expect(card.props.accessibilityLabel).toBe("Test Card");
      expect(card.props.accessibilityRole).toBe("button");
    });
  });
});
