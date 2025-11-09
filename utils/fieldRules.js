import { createSanitizationValidator } from "./inputSanitizer";

/**
 * Core field validation rules
 * Provides reusable validation strategies for different field types
 */

/**
 * Basic validation rule creators
 */
export const fieldValidators = {
  /**
   * Required field validation
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
  required: (message = "Este campo é obrigatório") => ({
    required: message,
  }),

  /**
   * Email validation
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
  email: (message = "Email inválido") => ({
    required: "Email é obrigatório",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message,
    },
  }),

  /**
   * Password validation
   * @param {number} minLength - Minimum password length
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
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

  /**
   * Confirm password validation
   * @param {string} passwordValue - Original password value to compare
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
  confirmPassword: (passwordValue, message = "As senhas não coincidem") => ({
    required: "Confirmação de senha é obrigatória",
    validate: (value) => value === passwordValue || message,
  }),

  /**
   * Text field validation with length constraints and sanitization
   * @param {number} minLength - Minimum text length
   * @param {number} maxLength - Maximum text length
   * @param {boolean} required - Whether field is required
   * @param {string} fieldName - Name of the field for error messages
   * @returns {Object} - Validation rule
   */
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

  /**
   * Title validation with sanitization
   * @param {number} minLength - Minimum title length
   * @param {number} maxLength - Maximum title length
   * @returns {Object} - Validation rule
   */
  title: (minLength = 1, maxLength = 100) =>
    fieldValidators.text(minLength, maxLength, true, "Título"),

  /**
   * Description validation with sanitization
   * @param {number} minLength - Minimum description length
   * @param {number} maxLength - Maximum description length
   * @returns {Object} - Validation rule
   */
  description: (minLength = 3, maxLength = 500) =>
    fieldValidators.text(minLength, maxLength, true, "Descrição"),

  /**
   * Currency/Amount validation
   * @param {Function} parseCurrency - Function to parse currency string
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
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

  /**
   * Category validation
   * @param {Array} allowedCategories - List of valid categories
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
  category: (allowedCategories = [], message = "Categoria é obrigatória") => ({
    required: message,
    validate: (value) => {
      if (allowedCategories.length === 0) return true;
      return allowedCategories.includes(value) || "Categoria inválida";
    },
  }),

  /**
   * Date validation
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
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

  /**
   * Frequency validation for recurring transactions
   * @param {Array} allowedFrequencies - List of valid frequency values
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
  frequency: (
    allowedFrequencies = ["daily", "weekly", "monthly", "yearly"],
    message = "Frequência é obrigatória"
  ) => ({
    required: message,
    validate: (value) => {
      return allowedFrequencies.includes(value) || "Frequência inválida";
    },
  }),

  /**
   * Numeric validation
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {string} message - Custom error message
   * @returns {Object} - Validation rule
   */
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

  /**
   * Custom validation wrapper
   * @param {Function} validationFn - Custom validation function
   * @param {string} message - Error message if validation fails
   * @returns {Object} - Validation rule
   */
  custom: (validationFn, message = "Valor inválido") => ({
    validate: (value) => validationFn(value) || message,
  }),
};
