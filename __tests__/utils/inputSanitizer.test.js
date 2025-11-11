/**
 * Test suite for input sanitization utilities
 * Tests sanitization functions to prevent XSS and ensure data integrity
 */

import {
  sanitizeInput,
  isSafeValue,
  sanitizeFormData,
  createSanitizationValidator,
} from "../../utils/inputSanitizer";

describe("Input Sanitizer", () => {
  describe("sanitizeInput", () => {
    it("should remove script tags", () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe("Hello World");
    });

    it("should remove iframe tags", () => {
      const maliciousInput = '<iframe src="evil.com"></iframe>Content';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe("Content");
    });

    it("should remove javascript URLs", () => {
      const maliciousInput = 'javascript:alert("xss") Normal text';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe("Normal text");
    });

    it("should remove event handlers", () => {
      const maliciousInput = 'onclick="alert()" onload="evil()" Normal text';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe("Normal text");
    });

    it("should trim leading whitespace but preserve trailing space", () => {
      const input = " Hello World ";
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe("Hello World ");
    });

    it("should trim leading whitespace without trailing space", () => {
      const input = " Hello World";
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe("Hello World");
    });

    it("should replace multiple consecutive spaces with single space", () => {
      const input = "Hello    World";
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe("Hello World");
    });

    it("should handle non-string input", () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });

    it("should handle empty string", () => {
      expect(sanitizeInput("")).toBe("");
    });

    it("should handle special characters correctly", () => {
      const specialChars = "!@#$%^&*()_+-={}[]|\\:\";'<>?,./";
      const sanitized = sanitizeInput(specialChars);
      expect(sanitized).not.toContain("<script");
      expect(sanitized).not.toContain("javascript:");
    });

    it("should handle unicode characters", () => {
      const unicodeText = "🔒 Secure Text 中文 العربية";
      const sanitized = sanitizeInput(unicodeText);
      expect(sanitized).toBe("🔒 Secure Text 中文 العربية");
    });
  });

  describe("isSafeValue", () => {
    it("should return true for safe values", () => {
      expect(isSafeValue("Hello World")).toBe(true);
      expect(isSafeValue("user@example.com")).toBe(true);
      expect(isSafeValue(123)).toBe(true);
    });

    it("should return false for dangerous values", () => {
      expect(isSafeValue('<script>alert("xss")</script>')).toBe(false);
      expect(isSafeValue('javascript:alert("xss")')).toBe(false);
      expect(isSafeValue('onclick="evil()"')).toBe(false);
    });
  });

  describe("sanitizeFormData", () => {
    it("should sanitize all string fields in an object", () => {
      const formData = {
        title: '<script>alert("xss")</script>Title',
        description: "Description with spaces",
        amount: 100,
        isActive: true,
        nested: {
          field: 'javascript:alert("evil")',
        },
      };

      const sanitized = sanitizeFormData(formData);

      expect(sanitized.title).toBe("Title");
      expect(sanitized.description).toBe("Description with spaces");
      expect(sanitized.amount).toBe(100);
      expect(sanitized.isActive).toBe(true);
      expect(sanitized.nested).toEqual({ field: 'javascript:alert("evil")' }); // Nested objects not sanitized
    });

    it("should handle null and undefined values gracefully", () => {
      expect(sanitizeFormData({ field: null })).toEqual({ field: null });
      expect(sanitizeFormData({ field: undefined })).toEqual({
        field: undefined,
      });
    });

    it("should handle empty objects and arrays", () => {
      expect(sanitizeFormData({})).toEqual({});
      expect(sanitizeFormData({ arr: [] })).toEqual({ arr: [] });
    });
  });

  describe("createSanitizationValidator", () => {
    it("should create a validator that sanitizes and validates input", () => {
      const validator = createSanitizationValidator(
        "Field contém caracteres inválidos"
      );

      expect(validator("Clean input")).toBe(true);
      expect(validator('<script>alert("xss")</script>Malicious')).toBe(
        "Field contém caracteres inválidos"
      );
    });

    it("should use default error message", () => {
      const validator = createSanitizationValidator();

      expect(validator('<script>alert("xss")</script>Malicious')).toBe(
        "Contém caracteres inválidos"
      );
    });
  });

  describe("Performance Tests", () => {
    it("should handle large text sanitization efficiently", () => {
      const largeText =
        "a".repeat(10000) + '<script>alert("xss")</script>' + "b".repeat(10000);

      const startTime = Date.now();
      const sanitized = sanitizeInput(largeText);
      const endTime = Date.now();

      expect(sanitized).toBe("a".repeat(10000) + "b".repeat(10000));
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it("should handle large form data sanitization efficiently", () => {
      const largeFormData = {};
      for (let i = 0; i < 1000; i++) {
        largeFormData[`field${i}`] = `value${i}<script>evil</script>`;
      }

      const startTime = Date.now();
      const sanitized = sanitizeFormData(largeFormData);
      const endTime = Date.now();

      expect(Object.keys(sanitized)).toHaveLength(1000);
      expect(sanitized.field0).toBe("value0");
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined values gracefully", () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe("Security Tests", () => {
    const xssVectors = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      "<svg onload=\"alert('XSS')\">",
      'javascript:alert("XSS")',
      "onclick=\"alert('XSS')\"",
      "<iframe src=\"javascript:alert('XSS')\"></iframe>",
      "<object data=\"javascript:alert('XSS')\"></object>",
      "<embed src=\"javascript:alert('XSS')\">",
      "onmouseover=\"alert('XSS')\"",
      "onfocus=\"alert('XSS')\"",
    ];

    xssVectors.forEach((vector, index) => {
      it(`should sanitize XSS vector ${index + 1}: ${vector.substring(
        0,
        50
      )}...`, () => {
        const sanitized = sanitizeInput(vector + "Safe Content");
        expect(sanitized).not.toContain("<script");
        expect(sanitized).not.toContain("javascript:");
        expect(sanitized).not.toContain("onerror");
        expect(sanitized).not.toContain("onload");
        expect(sanitized).not.toContain("onclick");
        expect(sanitized).not.toContain("<iframe");
        expect(sanitized).not.toContain("<object");
        expect(sanitized).not.toContain("<embed");
        expect(sanitized).toContain("Content");
      });
    });

    it("should detect dangerous content with isSafeValue", () => {
      xssVectors.forEach((vector) => {
        expect(isSafeValue(vector)).toBe(false);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should handle complex form data sanitization and validation", () => {
      // Simulate complex form with mixed clean and malicious data
      const formData = {
        title: '<script>alert("xss")</script>Clean Title',
        description: "Valid description with spaces",
        amount: "100.50",
        category: "food",
        notes: 'javascript:alert("evil") Some notes',
        tags: ["tag1", "tag2<script>evil</script>"],
      };

      // Sanitize the data
      const sanitizedData = sanitizeFormData(formData);

      expect(sanitizedData.title).toBe("Clean Title");
      expect(sanitizedData.description).toBe("Valid description with spaces");
      expect(sanitizedData.amount).toBe("100.50");
      expect(sanitizedData.category).toBe("food");
      expect(sanitizedData.notes).toBe("Some notes");
      // Arrays are not automatically sanitized in sanitizeFormData
      expect(sanitizedData.tags).toEqual(["tag1", "tag2<script>evil</script>"]);
    });
  });
});
