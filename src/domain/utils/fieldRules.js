import { createSanitizationValidator } from "./inputSanitizer";

export const fieldValidators = {
  required: (message = "Este campo é obrigatório") => ({
    required: message,
  }),

  email: (message = "Email inválido") => ({
    required: "Email é obrigatório",
    pattern: {
      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message,
    },
  }),

  password: (
    minLength = 6,
    message = `Senha deve ter pelo menos ${minLength} caracteres`
  ) => ({
    required: "Senha é obrigatória",
    minLength: {
      value: minLength,
      message,
    },
  }),

  confirmPassword: (passwordValue, message = "As senhas não coincidem") => ({
    required: "Confirmação de senha é obrigatória",
    validate: (value) => value === passwordValue || message,
  }),

  text: (
    minLength = 0,
    maxLength = 255,
    required = false,
    fieldName = "Campo"
  ) => {
    const rules = {};

    if (required) {
      rules.required = `${fieldName} é obrigatório`;
    }

    if (minLength > 0) {
      rules.minLength = {
        value: minLength,
        message: `${fieldName} deve ter pelo menos ${minLength} caracteres`,
      };
    }

    if (maxLength > 0) {
      rules.maxLength = {
        value: maxLength,
        message: `${fieldName} deve ter no máximo ${maxLength} caracteres`,
      };
    }

    rules.validate = createSanitizationValidator(
      `${fieldName} contém caracteres inválidos`
    );

    return rules;
  },

  title: (minLength = 1, maxLength = 100) =>
    fieldValidators.text(minLength, maxLength, true, "Título"),

  description: (minLength = 3, maxLength = 500) =>
    fieldValidators.text(minLength, maxLength, true, "Descrição"),

  currency: (
    parseCurrency,
    message = "Valor deve ser um número maior que zero"
  ) => ({
    required: "Valor é obrigatório",
    validate: (value) => {
      const amount = parseFloat(parseCurrency(value));
      if (isNaN(amount) || amount <= 0) {
        return message;
      }
      return true;
    },
  }),

  category: (allowedCategories = [], message = "Categoria é obrigatória") => ({
    required: message,
    validate: (value) => {
      if (allowedCategories.length === 0) return true;
      return allowedCategories.includes(value) || "Categoria inválida";
    },
  }),

  date: (message = "Data é obrigatória") => ({
    required: message,
    validate: (value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }
      return true;
    },
  }),

  frequency: (
    allowedFrequencies = ["daily", "weekly", "monthly", "yearly"],
    message = "Frequência é obrigatória"
  ) => ({
    required: message,
    validate: (value) => {
      return allowedFrequencies.includes(value) || "Frequência inválida";
    },
  }),

  numeric: (
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    message = "Valor numérico inválido"
  ) => ({
    required: "Este campo é obrigatório",
    validate: (value) => {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        return message;
      }
      if (numericValue < min || numericValue > max) {
        return `Valor deve estar entre ${min} e ${max}`;
      }
      return true;
    },
  }),

  custom: (validationFn, message = "Valor inválido") => ({
    validate: (value) => validationFn(value) || message,
  }),
};
