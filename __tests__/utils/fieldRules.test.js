/**
 * Test suite for field validation rules
 * Tests field validators that provide reusable validation strategies
 */

import { fieldValidators } from "../../utils/fieldRules";

describe("Field Validators", () => {
  describe("required", () => {
    it("should create required rule with default message", () => {
      const rule = fieldValidators.required();
      expect(rule.required).toBe("Este campo é obrigatório");
    });

    it("should create required rule with custom message", () => {
      const rule = fieldValidators.required("Custom message");
      expect(rule.required).toBe("Custom message");
    });
  });

  describe("email", () => {
    it("should validate correct email formats", () => {
      const rule = fieldValidators.email();
      expect(rule.pattern.value.test("user@example.com")).toBe(true);
      expect(rule.pattern.value.test("test.email+tag@domain.co.uk")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      const rule = fieldValidators.email();
      expect(rule.pattern.value.test("invalid-email")).toBe(false);
      expect(rule.pattern.value.test("@domain.com")).toBe(false);
      expect(rule.pattern.value.test("user@")).toBe(false);
    });

    it("should include required field validation", () => {
      const rule = fieldValidators.email();
      expect(rule.required).toBe("Email é obrigatório");
    });

    it("should use custom error message", () => {
      const rule = fieldValidators.email("Invalid email format");
      expect(rule.pattern.message).toBe("Invalid email format");
    });
  });

  describe("password", () => {
    it("should create password rule with minimum length", () => {
      const rule = fieldValidators.password(8);
      expect(rule.minLength.value).toBe(8);
      expect(rule.minLength.message).toBe(
        "Senha deve ter pelo menos 8 caracteres"
      );
    });

    it("should have default minimum length of 6", () => {
      const rule = fieldValidators.password();
      expect(rule.minLength.value).toBe(6);
    });

    it("should include required field validation", () => {
      const rule = fieldValidators.password();
      expect(rule.required).toBe("Senha é obrigatória");
    });

    it("should use custom error message", () => {
      const customMessage = "Password too short";
      const rule = fieldValidators.password(10, customMessage);
      expect(rule.minLength.message).toBe(customMessage);
    });
  });

  describe("confirmPassword", () => {
    it("should match password values", () => {
      const passwordValue = "mypassword123";
      const rule = fieldValidators.confirmPassword(passwordValue);
      const validator = rule.validate;

      expect(validator("mypassword123")).toBe(true);
      expect(validator("different-password")).toBe("As senhas não coincidem");
    });

    it("should include required field validation", () => {
      const rule = fieldValidators.confirmPassword("test");
      expect(rule.required).toBe("Confirmação de senha é obrigatória");
    });

    it("should use custom error message", () => {
      const customMessage = "Passwords don't match";
      const rule = fieldValidators.confirmPassword("test", customMessage);
      expect(rule.validate("different")).toBe(customMessage);
    });
  });

  describe("text", () => {
    it("should create basic text validation without requirements", () => {
      const rule = fieldValidators.text();
      expect(rule.required).toBeUndefined();
      expect(rule.minLength).toBeUndefined();
      expect(rule.maxLength.value).toBe(255);
    });

    it("should create required text field", () => {
      const rule = fieldValidators.text(0, 255, true, "Nome");
      expect(rule.required).toBe("Nome é obrigatório");
    });

    it("should set minimum and maximum length", () => {
      const rule = fieldValidators.text(5, 20, false, "Campo");
      expect(rule.minLength.value).toBe(5);
      expect(rule.minLength.message).toBe(
        "Campo deve ter pelo menos 5 caracteres"
      );
      expect(rule.maxLength.value).toBe(20);
      expect(rule.maxLength.message).toBe(
        "Campo deve ter no máximo 20 caracteres"
      );
    });

    it("should include sanitization validation", () => {
      const rule = fieldValidators.text(0, 255, false, "Título");
      expect(rule.validate).toBeDefined();
      expect(typeof rule.validate).toBe("function");
    });
  });

  describe("title", () => {
    it("should validate and sanitize title input", () => {
      const rule = fieldValidators.title();
      const validator = rule.validate;

      expect(validator("Valid Title")).toBe(true);
      expect(validator('<script>alert("xss")</script>Title')).toBe(
        "Título contém caracteres inválidos"
      );
    });

    it("should respect min and max length", () => {
      const rule = fieldValidators.title(5, 20);
      expect(rule.minLength.value).toBe(5);
      expect(rule.maxLength.value).toBe(20);
    });
  });

  describe("description", () => {
    it("should validate description with default constraints", () => {
      const rule = fieldValidators.description();
      expect(rule.minLength.value).toBe(3);
      expect(rule.maxLength.value).toBe(500);
    });

    it("should include sanitization validation", () => {
      const rule = fieldValidators.description();
      expect(rule.validate).toBeDefined();
      expect(typeof rule.validate).toBe("function");
    });
  });

  describe("currency", () => {
    const mockParseCurrency = jest.fn();

    beforeEach(() => {
      mockParseCurrency.mockClear();
    });

    it("should validate positive currency values", () => {
      mockParseCurrency.mockReturnValue("100.50");
      const rule = fieldValidators.currency(mockParseCurrency);
      const validator = rule.validate;

      const result = validator("$100.50");
      expect(result).toBe(true);
      expect(mockParseCurrency).toHaveBeenCalledWith("$100.50");
    });

    it("should reject zero and negative values", () => {
      mockParseCurrency.mockReturnValue("0");
      const rule = fieldValidators.currency(mockParseCurrency);
      const validator = rule.validate;

      const result = validator("$0.00");
      expect(result).toBe("Valor deve ser um número maior que zero");
    });

    it("should reject invalid numeric values", () => {
      mockParseCurrency.mockReturnValue("NaN");
      const rule = fieldValidators.currency(mockParseCurrency);
      const validator = rule.validate;

      const result = validator("invalid");
      expect(result).toBe("Valor deve ser um número maior que zero");
    });

    it("should include required field validation", () => {
      const rule = fieldValidators.currency(() => "100");
      expect(rule.required).toBe("Valor é obrigatório");
    });

    it("should use custom error message", () => {
      const customMessage = "Invalid amount";
      const rule = fieldValidators.currency(() => "0", customMessage);
      const result = rule.validate("0");
      expect(result).toBe(customMessage);
    });
  });

  describe("category", () => {
    it("should validate against allowed categories", () => {
      const allowedCategories = ["food", "transport", "entertainment"];
      const rule = fieldValidators.category(allowedCategories);
      const validator = rule.validate;

      expect(validator("food")).toBe(true);
      expect(validator("invalid-category")).toBe("Categoria inválida");
    });

    it("should allow any category when no restrictions", () => {
      const rule = fieldValidators.category([]);
      const validator = rule.validate;

      expect(validator("any-category")).toBe(true);
    });

    it("should include required field validation", () => {
      const rule = fieldValidators.category([]);
      expect(rule.required).toBe("Categoria é obrigatória");
    });

    it("should use custom error message", () => {
      const customMessage = "Invalid category selected";
      const rule = fieldValidators.category([], customMessage);
      expect(rule.required).toBe(customMessage);
    });
  });

  describe("date", () => {
    it("should validate valid dates", () => {
      const rule = fieldValidators.date();
      const validator = rule.validate;

      expect(validator("2023-12-31")).toBe(true);
      expect(validator(new Date().toISOString())).toBe(true);
    });

    it("should reject invalid dates", () => {
      const rule = fieldValidators.date();
      const validator = rule.validate;

      expect(validator("invalid-date")).toBe("Data inválida");
      expect(validator("2023-13-01")).toBe("Data inválida");
    });

    it("should include required field validation", () => {
      const rule = fieldValidators.date();
      expect(rule.required).toBe("Data é obrigatória");
    });

    it("should use custom error message", () => {
      const customMessage = "Date is required";
      const rule = fieldValidators.date(customMessage);
      expect(rule.required).toBe(customMessage);
    });
  });

  describe("frequency", () => {
    it("should validate allowed frequency values", () => {
      const rule = fieldValidators.frequency();
      const validator = rule.validate;

      expect(validator("daily")).toBe(true);
      expect(validator("weekly")).toBe(true);
      expect(validator("monthly")).toBe(true);
      expect(validator("yearly")).toBe(true);
      expect(validator("invalid-frequency")).toBe("Frequência inválida");
    });

    it("should accept custom allowed frequencies", () => {
      const customFrequencies = ["hourly", "bi-weekly"];
      const rule = fieldValidators.frequency(customFrequencies);
      const validator = rule.validate;

      expect(validator("hourly")).toBe(true);
      expect(validator("bi-weekly")).toBe(true);
      expect(validator("daily")).toBe("Frequência inválida");
    });

    it("should include required field validation", () => {
      const rule = fieldValidators.frequency();
      expect(rule.required).toBe("Frequência é obrigatória");
    });

    it("should use custom error message", () => {
      const customMessage = "Frequency is required";
      const rule = fieldValidators.frequency([], customMessage);
      expect(rule.required).toBe(customMessage);
    });
  });

  describe("numeric", () => {
    it("should validate numeric range", () => {
      const rule = fieldValidators.numeric(0, 100);
      const validator = rule.validate;

      expect(validator("50")).toBe(true);
      expect(validator("0")).toBe(true);
      expect(validator("100")).toBe(true);
      expect(validator("150")).toBe("Valor deve estar entre 0 e 100");
      expect(validator("-10")).toBe("Valor deve estar entre 0 e 100");
      expect(validator("invalid")).toBe("Valor numérico inválido");
    });

    it("should use default range when not specified", () => {
      const rule = fieldValidators.numeric();
      const validator = rule.validate;

      expect(validator("1000000")).toBe(true);
      expect(validator("0")).toBe(true);
    });

    it("should include required field validation", () => {
      const rule = fieldValidators.numeric();
      expect(rule.required).toBe("Este campo é obrigatório");
    });

    it("should use custom error message", () => {
      const customMessage = "Invalid number";
      const rule = fieldValidators.numeric(0, 10, customMessage);
      const validator = rule.validate;

      expect(validator("not-a-number")).toBe(customMessage);
    });
  });

  describe("custom", () => {
    it("should use custom validation function", () => {
      const customValidator = (value) => value.includes("test");
      const rule = fieldValidators.custom(
        customValidator,
        'Must contain "test"'
      );
      const validator = rule.validate;

      expect(validator("test input")).toBe(true);
      expect(validator("invalid input")).toBe('Must contain "test"');
    });

    it("should use default error message", () => {
      const customValidator = () => false;
      const rule = fieldValidators.custom(customValidator);
      const validator = rule.validate;

      expect(validator("any-value")).toBe("Valor inválido");
    });

    it("should support complex validation logic", () => {
      const emailAndLengthValidator = (value) =>
        value.includes("@") && value.length > 5;
      const rule = fieldValidators.custom(
        emailAndLengthValidator,
        "Must be a valid email with more than 5 characters"
      );
      const validator = rule.validate;

      expect(validator("user@example.com")).toBe(true);
      expect(validator("u@x")).toBe(
        "Must be a valid email with more than 5 characters"
      );
      expect(validator("no-at-symbol")).toBe(
        "Must be a valid email with more than 5 characters"
      );
    });
  });

  describe("Integration Tests", () => {
    it("should create complex validation rules", () => {
      // Test combining multiple validation types
      const titleRule = fieldValidators.title(3, 50);
      const emailRule = fieldValidators.email();
      const currencyRule = fieldValidators.currency((val) =>
        val.replace(/[^0-9.]/g, "")
      );

      expect(titleRule.minLength.value).toBe(3);
      expect(titleRule.maxLength.value).toBe(50);
      expect(titleRule.validate).toBeDefined();

      expect(emailRule.required).toBe("Email é obrigatório");
      expect(emailRule.pattern).toBeDefined();

      expect(currencyRule.required).toBe("Valor é obrigatório");
      expect(currencyRule.validate).toBeDefined();
    });

    it("should handle edge cases gracefully", () => {
      // Test validators with edge case inputs
      const numericRule = fieldValidators.numeric(0, 100);
      const validator = numericRule.validate;

      expect(validator("50.5")).toBe(true);
      expect(validator("0.1")).toBe(true);
      expect(validator("99.999")).toBe(true);
    });
  });
});
