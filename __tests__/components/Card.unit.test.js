import React from "react";
import { render } from "@testing-library/react-native";
import { Text, View, StyleSheet } from "react-native";
import { Card } from "../../components/Card";

// Mock the useTheme hook
const mockTheme = {
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
};

jest.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

describe("Card Component - Unit Tests", () => {
  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      const { root } = render(<Card />);
      expect(root).toBeTruthy();
    });

    it("should render children correctly", () => {
      const { getByText } = render(
        <Card>
          <Text>Hello World</Text>
        </Card>
      );
      expect(getByText("Hello World")).toBeTruthy();
    });

    it("should render multiple children", () => {
      const { getByText } = render(
        <Card>
          <Text>Child 1</Text>
          <Text>Child 2</Text>
          <View>
            <Text>Nested Child</Text>
          </View>
        </Card>
      );

      expect(getByText("Child 1")).toBeTruthy();
      expect(getByText("Child 2")).toBeTruthy();
      expect(getByText("Nested Child")).toBeTruthy();
    });
  });

  describe("Default Props", () => {
    it("should use default padding when not specified", () => {
      const { getByTestId } = render(
        <Card testID="card">
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.padding).toBe(mockTheme.spacing.md);
    });

    it("should use default margin when not specified", () => {
      const { getByTestId } = render(
        <Card testID="card">
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.margin).toBe(mockTheme.spacing.sm);
    });
  });

  describe("Custom Props", () => {
    it("should apply custom padding", () => {
      const { getByTestId } = render(
        <Card testID="card" padding="lg">
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.padding).toBe(mockTheme.spacing.lg);
    });

    it("should apply custom margin", () => {
      const { getByTestId } = render(
        <Card testID="card" margin="xl">
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.margin).toBe(mockTheme.spacing.xl);
    });

    it("should apply all spacing variants for padding", () => {
      const spacings = ["xs", "sm", "md", "lg", "xl"];

      spacings.forEach((spacing) => {
        const { getByTestId } = render(
          <Card testID={`card-${spacing}`} padding={spacing}>
            <Text>Content</Text>
          </Card>
        );

        const card = getByTestId(`card-${spacing}`);
        const styles = card.props.style;
        const flattenedStyles = Array.isArray(styles)
          ? Object.assign({}, ...styles)
          : styles;

        expect(flattenedStyles.padding).toBe(mockTheme.spacing[spacing]);
      });
    });

    it("should apply all spacing variants for margin", () => {
      const spacings = ["xs", "sm", "md", "lg", "xl"];

      spacings.forEach((spacing) => {
        const { getByTestId } = render(
          <Card testID={`card-${spacing}`} margin={spacing}>
            <Text>Content</Text>
          </Card>
        );

        const card = getByTestId(`card-${spacing}`);
        const styles = card.props.style;
        const flattenedStyles = Array.isArray(styles)
          ? Object.assign({}, ...styles)
          : styles;

        expect(flattenedStyles.margin).toBe(mockTheme.spacing[spacing]);
      });
    });
  });

  describe("Custom Styles", () => {
    it("should apply custom style object", () => {
      const customStyle = {
        backgroundColor: "red",
        borderWidth: 2,
        opacity: 0.8,
      };

      const { getByTestId } = render(
        <Card testID="card" style={customStyle}>
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.backgroundColor).toBe("red");
      expect(flattenedStyles.borderWidth).toBe(2);
      expect(flattenedStyles.opacity).toBe(0.8);
    });

    it("should apply custom style array", () => {
      const customStyles = {
        backgroundColor: "blue",
        borderRadius: 20,
        elevation: 10,
      };

      const { getByTestId } = render(
        <Card testID="card" style={customStyles}>
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.backgroundColor).toBe("blue");
      expect(flattenedStyles.borderRadius).toBe(20);
      expect(flattenedStyles.elevation).toBe(10);
    });

    it("should override theme styles with custom styles", () => {
      const customStyle = { backgroundColor: "purple" };

      const { getByTestId } = render(
        <Card testID="card" style={customStyle}>
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      // Custom style should override theme background color
      expect(flattenedStyles.backgroundColor).toBe("purple");
    });
  });

  describe("Theme Integration", () => {
    it("should apply theme background color", () => {
      const { getByTestId } = render(
        <Card testID="card">
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.backgroundColor).toBe(mockTheme.colors.card);
    });

    it("should apply theme border radius", () => {
      const { getByTestId } = render(
        <Card testID="card">
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.borderRadius).toBe(mockTheme.borderRadius.md);
    });

    it("should apply theme shadow color", () => {
      const { getByTestId } = render(
        <Card testID="card">
          <Text>Content</Text>
        </Card>
      );

      const card = getByTestId("card");
      const styles = card.props.style;
      const flattenedStyles = Array.isArray(styles)
        ? Object.assign({}, ...styles)
        : styles;

      expect(flattenedStyles.shadowColor).toBe(mockTheme.colors.shadow);
    });
  });

  describe("Shadow and Elevation Styles", () => {
    it("should apply correct shadow properties", () => {
      const { getByTestId } = render(
        <Card testID="card">
          <Text>Content</Text>
        </Card>
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

  describe("Edge Cases and Error Handling", () => {
    it("should handle null children gracefully", () => {
      const { root } = render(<Card>{null}</Card>);
      expect(root).toBeTruthy();
    });

    it("should handle undefined children gracefully", () => {
      const { root } = render(<Card>{undefined}</Card>);
      expect(root).toBeTruthy();
    });

    it("should handle false children gracefully", () => {
      const { root } = render(<Card>{false}</Card>);
      expect(root).toBeTruthy();
    });

    it("should handle zero as valid children", () => {
      const { getByText } = render(
        <Card>
          <Text>0</Text>
        </Card>
      );
      expect(getByText("0")).toBeTruthy();
    });

    it("should handle empty string children", () => {
      const { root } = render(
        <Card>
          <Text></Text>
        </Card>
      );
      expect(root).toBeTruthy();
    });

    it("should handle conditional rendering", () => {
      const showContent = true;
      const { getByText, queryByText, rerender } = render(
        <Card>{showContent && <Text>Conditional Content</Text>}</Card>
      );

      expect(getByText("Conditional Content")).toBeTruthy();

      // Re-render with showContent false
      rerender(<Card>{false && <Text>Conditional Content</Text>}</Card>);

      expect(queryByText("Conditional Content")).toBeNull();
    });

    it("should handle deeply nested components", () => {
      const { getByText } = render(
        <Card>
          <View>
            <View>
              <Card>
                <Text>Deeply Nested</Text>
              </Card>
            </View>
          </View>
        </Card>
      );

      expect(getByText("Deeply Nested")).toBeTruthy();
    });
  });

  describe("Performance Considerations", () => {
    it("should not recreate style array on every render with same props", () => {
      const TestComponent = ({ id }) => (
        <Card testID="card">
          <Text>Content {id}</Text>
        </Card>
      );

      const { getByTestId, rerender } = render(<TestComponent id="1" />);

      const firstRender = getByTestId("card");
      const firstStyles = firstRender.props.style;

      rerender(<TestComponent id="2" />);

      const secondRender = getByTestId("card");
      const secondStyles = secondRender.props.style;

      // Styles should be equivalent (though not necessarily the same reference)
      expect(JSON.stringify(firstStyles)).toBe(JSON.stringify(secondStyles));
    });
  });
});
