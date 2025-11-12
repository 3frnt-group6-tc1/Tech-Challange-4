import React from "react";
import { render, act } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { useImagePreview } from "../../hooks/useImagePreview";

describe("useImagePreview", () => {
  // Test component to use the hook
  const TestComponent = () => {
    const hookResult = useImagePreview();

    // Expose hook result for testing
    global.hookResult = hookResult;

    return (
      <View>
        <Text testID="visible">{String(hookResult.imagePreviewVisible)}</Text>
        <Text testID="uri">{hookResult.imagePreviewUri || "null"}</Text>
      </View>
    );
  };

  beforeEach(() => {
    global.hookResult = null;
  });

  afterEach(() => {
    delete global.hookResult;
  });

  describe("Initial State", () => {
    it("initializes with imagePreviewVisible as false", () => {
      render(<TestComponent />);

      expect(global.hookResult.imagePreviewVisible).toBe(false);
    });

    it("initializes with imagePreviewUri as null", () => {
      render(<TestComponent />);

      expect(global.hookResult.imagePreviewUri).toBeNull();
    });
  });

  describe("openImagePreview", () => {
    it("sets imagePreviewVisible to true", () => {
      render(<TestComponent />);

      act(() => {
        global.hookResult.openImagePreview("https://example.com/image.jpg");
      });

      expect(global.hookResult.imagePreviewVisible).toBe(true);
    });

    it("sets imagePreviewUri to the provided URI", () => {
      render(<TestComponent />);

      const testUri = "https://example.com/image.jpg";

      act(() => {
        global.hookResult.openImagePreview(testUri);
      });

      expect(global.hookResult.imagePreviewUri).toBe(testUri);
    });

    it("updates both visible and uri simultaneously", () => {
      render(<TestComponent />);

      const testUri = "https://example.com/photo.png";

      act(() => {
        global.hookResult.openImagePreview(testUri);
      });

      expect(global.hookResult.imagePreviewVisible).toBe(true);
      expect(global.hookResult.imagePreviewUri).toBe(testUri);
    });

    it("can open different images sequentially", () => {
      render(<TestComponent />);

      const firstUri = "https://example.com/image1.jpg";
      const secondUri = "https://example.com/image2.jpg";

      act(() => {
        global.hookResult.openImagePreview(firstUri);
      });

      expect(global.hookResult.imagePreviewUri).toBe(firstUri);

      act(() => {
        global.hookResult.openImagePreview(secondUri);
      });

      expect(global.hookResult.imagePreviewUri).toBe(secondUri);
      expect(global.hookResult.imagePreviewVisible).toBe(true);
    });
  });

  describe("closeImagePreview", () => {
    it("sets imagePreviewVisible to false", () => {
      render(<TestComponent />);

      // First open the preview
      act(() => {
        global.hookResult.openImagePreview("https://example.com/image.jpg");
      });

      expect(global.hookResult.imagePreviewVisible).toBe(true);

      // Then close it
      act(() => {
        global.hookResult.closeImagePreview();
      });

      expect(global.hookResult.imagePreviewVisible).toBe(false);
    });

    it("sets imagePreviewUri to null", () => {
      render(<TestComponent />);

      // First open the preview
      act(() => {
        global.hookResult.openImagePreview("https://example.com/image.jpg");
      });

      expect(global.hookResult.imagePreviewUri).toBe(
        "https://example.com/image.jpg"
      );

      // Then close it
      act(() => {
        global.hookResult.closeImagePreview();
      });

      expect(global.hookResult.imagePreviewUri).toBeNull();
    });

    it("clears both visible and uri simultaneously", () => {
      render(<TestComponent />);

      // Open preview
      act(() => {
        global.hookResult.openImagePreview("https://example.com/image.jpg");
      });

      expect(global.hookResult.imagePreviewVisible).toBe(true);
      expect(global.hookResult.imagePreviewUri).toBe(
        "https://example.com/image.jpg"
      );

      // Close preview
      act(() => {
        global.hookResult.closeImagePreview();
      });

      expect(global.hookResult.imagePreviewVisible).toBe(false);
      expect(global.hookResult.imagePreviewUri).toBeNull();
    });

    it("can be called when already closed without errors", () => {
      render(<TestComponent />);

      expect(global.hookResult.imagePreviewVisible).toBe(false);

      expect(() => {
        act(() => {
          global.hookResult.closeImagePreview();
        });
      }).not.toThrow();

      expect(global.hookResult.imagePreviewVisible).toBe(false);
      expect(global.hookResult.imagePreviewUri).toBeNull();
    });
  });

  describe("Function Stability", () => {
    it("openImagePreview function reference remains stable", () => {
      const { rerender } = render(<TestComponent />);

      const firstOpenFunction = global.hookResult.openImagePreview;

      rerender(<TestComponent />);

      const secondOpenFunction = global.hookResult.openImagePreview;

      expect(firstOpenFunction).toBe(secondOpenFunction);
    });

    it("closeImagePreview function reference remains stable", () => {
      const { rerender } = render(<TestComponent />);

      const firstCloseFunction = global.hookResult.closeImagePreview;

      rerender(<TestComponent />);

      const secondCloseFunction = global.hookResult.closeImagePreview;

      expect(firstCloseFunction).toBe(secondCloseFunction);
    });
  });

  describe("Complete Flow", () => {
    it("handles complete open-close cycle", () => {
      render(<TestComponent />);

      // Initial state
      expect(global.hookResult.imagePreviewVisible).toBe(false);
      expect(global.hookResult.imagePreviewUri).toBeNull();

      // Open preview
      act(() => {
        global.hookResult.openImagePreview("https://example.com/image.jpg");
      });

      expect(global.hookResult.imagePreviewVisible).toBe(true);
      expect(global.hookResult.imagePreviewUri).toBe(
        "https://example.com/image.jpg"
      );

      // Close preview
      act(() => {
        global.hookResult.closeImagePreview();
      });

      expect(global.hookResult.imagePreviewVisible).toBe(false);
      expect(global.hookResult.imagePreviewUri).toBeNull();
    });

    it("handles multiple open-close cycles", () => {
      render(<TestComponent />);

      // First cycle
      act(() => {
        global.hookResult.openImagePreview("https://example.com/image1.jpg");
      });
      expect(global.hookResult.imagePreviewVisible).toBe(true);

      act(() => {
        global.hookResult.closeImagePreview();
      });
      expect(global.hookResult.imagePreviewVisible).toBe(false);

      // Second cycle
      act(() => {
        global.hookResult.openImagePreview("https://example.com/image2.jpg");
      });
      expect(global.hookResult.imagePreviewVisible).toBe(true);
      expect(global.hookResult.imagePreviewUri).toBe(
        "https://example.com/image2.jpg"
      );

      act(() => {
        global.hookResult.closeImagePreview();
      });
      expect(global.hookResult.imagePreviewVisible).toBe(false);
      expect(global.hookResult.imagePreviewUri).toBeNull();
    });
  });
});
