/**
 * Test suite for form validation sets
 * Tests complete form validation schemas that combine field validators
 */

import { formValidationSets } from "../../utils/formFieldRules";

describe("Form Validation Sets", () => {
  describe("login", () => {
    it("should include email and password validation", () => {
      const rules = formValidationSets.login;
      expect(rules.email).toBeDefined();
      expect(rules.password).toBeDefined();
      expect(rules.email.required).toBe("Email é obrigatório");
      expect(rules.password.required).toBe("Senha é obrigatória");
    });

    it("should have proper email pattern validation", () => {
      const rules = formValidationSets.login;
      expect(rules.email.pattern.value.test("user@example.com")).toBe(true);
      expect(rules.email.pattern.value.test("invalid-email")).toBe(false);
    });

    it("should have minimum password length", () => {
      const rules = formValidationSets.login;
      expect(rules.password.minLength.value).toBe(6);
    });
  });

  describe("register", () => {
    it("should include email, password, and confirmPassword validation", () => {
      const passwordValue = "testpassword";
      const rules = formValidationSets.register(passwordValue);

      expect(rules.email).toBeDefined();
      expect(rules.password).toBeDefined();
      expect(rules.confirmPassword).toBeDefined();

      const confirmPasswordValidator = rules.confirmPassword.validate;
      expect(confirmPasswordValidator("testpassword")).toBe(true);
      expect(confirmPasswordValidator("different")).toBe(
        "As senhas não coincidem"
      );
    });

    it("should validate email format", () => {
      const rules = formValidationSets.register("password123");
      expect(rules.email.pattern.value.test("user@test.com")).toBe(true);
      expect(rules.email.pattern.value.test("invalid")).toBe(false);
    });

    it("should validate password confirmation", () => {
      const password = "mySecretPassword";
      const rules = formValidationSets.register(password);

      expect(rules.confirmPassword.validate(password)).toBe(true);
      expect(rules.confirmPassword.validate("wrongPassword")).toBe(
        "As senhas não coincidem"
      );
    });
  });

  describe("transaction", () => {
    it("should include all transaction fields", () => {
      const categories = ["food", "transport"];
      const parseCurrency = jest.fn().mockReturnValue("100");
      const rules = formValidationSets.transaction(categories, parseCurrency);

      expect(rules.title).toBeDefined();
      expect(rules.description).toBeDefined();
      expect(rules.amount).toBeDefined();
      expect(rules.category).toBeDefined();
      expect(rules.date).toBeDefined();
    });

    it("should validate title with sanitization", () => {
      const rules = formValidationSets.transaction([], () => "100");

      expect(rules.title.validate("Clean Title")).toBe(true);
      expect(rules.title.validate('<script>alert("xss")</script>Title')).toBe(
        "Título contém caracteres inválidos"
      );
    });

    it("should validate category against allowed values", () => {
      const categories = ["food", "transport", "entertainment"];
      const rules = formValidationSets.transaction(categories, () => "100");

      expect(rules.category.validate("food")).toBe(true);
      expect(rules.category.validate("invalid-category")).toBe(
        "Categoria inválida"
      );
    });

    it("should validate currency amounts", () => {
      const parseCurrency = jest.fn();
      const rules = formValidationSets.transaction([], parseCurrency);

      parseCurrency.mockReturnValue("100.50");
      expect(rules.amount.validate("$100.50")).toBe(true);

      parseCurrency.mockReturnValue("0");
      expect(rules.amount.validate("$0.00")).toBe(
        "Valor deve ser um número maior que zero"
      );
    });

    it("should validate dates", () => {
      const rules = formValidationSets.transaction([], () => "100");

      expect(rules.date.validate("2023-12-31")).toBe(true);
      expect(rules.date.validate("invalid-date")).toBe("Data inválida");
    });
  });

  describe("recurringTransaction", () => {
    it("should include all recurring transaction fields", () => {
      const categories = ["food", "transport"];
      const parseCurrency = jest.fn().mockReturnValue("100");
      const rules = formValidationSets.recurringTransaction(
        categories,
        parseCurrency
      );

      expect(rules.title).toBeDefined();
      expect(rules.description).toBeDefined();
      expect(rules.amount).toBeDefined();
      expect(rules.category).toBeDefined();
      expect(rules.frequency).toBeDefined();
      expect(rules.nextDueDate).toBeDefined();
    });

    it("should validate frequency values", () => {
      const rules = formValidationSets.recurringTransaction([], () => "100");

      expect(rules.frequency.validate("monthly")).toBe(true);
      expect(rules.frequency.validate("weekly")).toBe(true);
      expect(rules.frequency.validate("invalid")).toBe("Frequência inválida");
    });

    it("should validate next due date", () => {
      const rules = formValidationSets.recurringTransaction([], () => "100");

      expect(rules.nextDueDate.required).toBe(
        "Data de vencimento é obrigatória"
      );
      expect(rules.nextDueDate.validate("2024-01-01")).toBe(true);
      expect(rules.nextDueDate.validate("invalid")).toBe("Data inválida");
    });
  });

  describe("profile", () => {
    it("should include name and email validation", () => {
      const rules = formValidationSets.profile();

      expect(rules.name).toBeDefined();
      expect(rules.email).toBeDefined();
      expect(rules.name.required).toBe("Nome é obrigatório");
      expect(rules.name.minLength.value).toBe(2);
      expect(rules.name.maxLength.value).toBe(100);
    });

    it("should validate name length constraints", () => {
      const rules = formValidationSets.profile();

      expect(rules.name.minLength.value).toBe(2);
      expect(rules.name.maxLength.value).toBe(100);
    });
  });

  describe("settings", () => {
    it("should include currency and theme validation", () => {
      const rules = formValidationSets.settings();

      expect(rules.currency).toBeDefined();
      expect(rules.theme).toBeDefined();
      expect(rules.currency.required).toBe("Moeda é obrigatória");
      expect(rules.theme.required).toBe("Tema é obrigatório");
    });
  });

  describe("category", () => {
    it("should include name and type validation", () => {
      const rules = formValidationSets.category();

      expect(rules.name).toBeDefined();
      expect(rules.type).toBeDefined();
      expect(rules.name.required).toBe("Nome da categoria é obrigatório");
      expect(rules.type.required).toBe("Tipo é obrigatório");
    });

    it("should validate category name constraints", () => {
      const rules = formValidationSets.category();

      expect(rules.name.minLength.value).toBe(2);
      expect(rules.name.maxLength.value).toBe(50);
    });
  });

  describe("export", () => {
    it("should include all export form fields", () => {
      const rules = formValidationSets.export();

      expect(rules.startDate).toBeDefined();
      expect(rules.endDate).toBeDefined();
      expect(rules.format).toBeDefined();
      expect(rules.startDate.required).toBe("Data inicial é obrigatória");
      expect(rules.endDate.required).toBe("Data final é obrigatória");
      expect(rules.format.required).toBe("Formato é obrigatório");
    });

    it("should validate date fields", () => {
      const rules = formValidationSets.export();

      expect(rules.startDate.validate("2023-01-01")).toBe(true);
      expect(rules.endDate.validate("2023-12-31")).toBe(true);
      expect(rules.startDate.validate("invalid")).toBe("Data inválida");
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete form validation with all field types", () => {
      const categories = ["food", "transport", "entertainment"];
      const parseCurrency = (value) => value.replace(/[^0-9.]/g, "");

      const rules = formValidationSets.transaction(categories, parseCurrency);

      // Test valid data
      expect(rules.title.validate("Valid Title")).toBe(true);
      expect(rules.category.validate("food")).toBe(true);
      expect(rules.amount.validate("100.50")).toBe(true);
      expect(rules.date.validate("2023-12-31")).toBe(true);

      // Test invalid data
      expect(rules.title.validate("<script>evil</script>Title")).toBe(
        "Título contém caracteres inválidos"
      );
      expect(rules.category.validate("invalid-category")).toBe(
        "Categoria inválida"
      );
      expect(rules.amount.validate("0")).toBe(
        "Valor deve ser um número maior que zero"
      );
      expect(rules.date.validate("invalid-date")).toBe("Data inválida");
    });

    it("should provide consistent validation across different form types", () => {
      const loginRules = formValidationSets.login;
      const registerRules = formValidationSets.register("password123");

      // Both should have email validation
      expect(loginRules.email.required).toBe(registerRules.email.required);
      expect(loginRules.email.pattern.value.toString()).toBe(
        registerRules.email.pattern.value.toString()
      );
    });

    it("should support dynamic configuration", () => {
      const categories1 = ["food", "transport"];
      const categories2 = ["entertainment", "utilities", "health"];

      const rules1 = formValidationSets.transaction(categories1, () => "100");
      const rules2 = formValidationSets.transaction(categories2, () => "100");

      expect(rules1.category.validate("food")).toBe(true);
      expect(rules1.category.validate("entertainment")).toBe(
        "Categoria inválida"
      );

      expect(rules2.category.validate("entertainment")).toBe(true);
      expect(rules2.category.validate("food")).toBe("Categoria inválida");
    });
  });
});
