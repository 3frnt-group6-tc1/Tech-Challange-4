/**
 * Centralized validation rules for form fields
 * Provides reusable validation strategies with sanitization
 */

/**
 * Sanitizes user input to prevent XSS and clean data
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  let result = input
    // Remove script tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove iframe tags and their contents
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Remove object tags and their contents
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    // Remove embed tags and their contents
    .replace(/<embed\b[^>]*>/gi, "")
    // Remove javascript: protocols and everything until whitespace
    .replace(/javascript\s*:[^"'\s]*(?:"[^"]*"|'[^']*')*[^"'\s]*/gi, "")
    // Remove event handlers (on* attributes) - comprehensive patterns
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^"'\s>]+/gi, "")
    // Remove standalone event handlers
    .replace(/\bon\w+="[^"]*"/gi, "")
    .replace(/\bon\w+='[^']*'/gi, "");

  // Only trim if the result starts/ends with whitespace and the original doesn't
  if (
    result !== input.trim() &&
    (input.startsWith(" ") || input.endsWith(" "))
  ) {
    return result;
  }

  return result.trim();
};

/**
 * Validation strategies for different field types
 */
export const validationRules = {
  // Required field validation
  required: (message = "Este campo é obrigatório") => ({
    required: message,
  }),

  // Email validation
  email: (message = "Email inválido") => ({
    required: "Email é obrigatório",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message,
    },
  }),

  // Password validation
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

  // Confirm password validation
  confirmPassword: (passwordValue, message = "As senhas não coincidem") => ({
    required: "Confirmação de senha é obrigatória",
    validate: (value) => value === passwordValue || message,
  }),

  // Title/Name validation with sanitization
  title: (minLength = 1, maxLength = 100) => ({
    required: "Título é obrigatório",
    minLength: {
      value: minLength,
      message: `Título deve ter pelo menos ${minLength} caracteres`,
    },
    maxLength: {
      value: maxLength,
      message: `Título deve ter no máximo ${maxLength} caracteres`,
    },
    validate: (value) => {
      const sanitized = sanitizeInput(value);
      if (sanitized !== value) {
        return "Título contém caracteres inválidos";
      }
      return true;
    },
  }),

  // Description validation with sanitization
  description: (minLength = 3, maxLength = 500) => ({
    required: "Descrição é obrigatória",
    minLength: {
      value: minLength,
      message: `Descrição deve ter pelo menos ${minLength} caracteres`,
    },
    maxLength: {
      value: maxLength,
      message: `Descrição deve ter no máximo ${maxLength} caracteres`,
    },
    validate: (value) => {
      const sanitized = sanitizeInput(value);
      if (sanitized !== value) {
        return "Descrição contém caracteres inválidos";
      }
      return true;
    },
  }),

  // Currency/Amount validation
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

  // Category validation
  category: (allowedCategories = [], message = "Categoria é obrigatória") => ({
    required: message,
    validate: (value) => {
      if (allowedCategories.length === 0) return true;
      return allowedCategories.includes(value) || "Categoria inválida";
    },
  }),

  // Date validation
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

  // Generic text validation with sanitization
  text: (minLength = 0, maxLength = 255, required = false) => ({
    ...(required && { required: "Este campo é obrigatório" }),
    ...(minLength > 0 && {
      minLength: {
        value: minLength,
        message: `Deve ter pelo menos ${minLength} caracteres`,
      },
    }),
    maxLength: {
      value: maxLength,
      message: `Deve ter no máximo ${maxLength} caracteres`,
    },
    validate: (value) => {
      if (!value && !required) return true;
      const sanitized = sanitizeInput(value);
      if (sanitized !== value) {
        return "Texto contém caracteres inválidos";
      }
      return true;
    },
  }),

  // Numeric validation
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

  // Custom validation wrapper
  custom: (validationFn, message = "Valor inválido") => ({
    validate: (value) => validationFn(value) || message,
  }),
};

/**
 * Predefined validation sets for common forms
 */
export const validationSets = {
  // Login form
  login: {
    email: validationRules.email(),
    password: validationRules.password(),
  },

  // Registration form
  register: (passwordValue) => ({
    email: validationRules.email(),
    password: validationRules.password(),
    confirmPassword: validationRules.confirmPassword(passwordValue),
  }),

  // Transaction form
  transaction: (categories = [], parseCurrency) => ({
    title: validationRules.title(),
    description: validationRules.description(),
    amount: validationRules.currency(parseCurrency),
    category: validationRules.category(categories),
    date: validationRules.date(),
  }),

  // Recurring transaction form
  recurringTransaction: (categories = [], parseCurrency) => ({
    title: validationRules.title(),
    description: validationRules.description(),
    amount: validationRules.currency(parseCurrency),
    category: validationRules.category(categories),
    frequency: validationRules.required("Frequência é obrigatória"),
    nextDueDate: validationRules.date("Data de vencimento é obrigatória"),
  }),
};

/**
 * Sanitizes all string fields in an object
 * @param {Object} data - Object with form data
 * @returns {Object} - Object with sanitized string values
 */
export const sanitizeFormData = (data) => {
  const sanitized = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (typeof value === "string") {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

/**
 * Validates if a value is safe (doesn't contain potentially harmful content)
 * @param {string} value - Value to check
 * @returns {boolean} - True if safe
 */
export const isSafeValue = (value) => {
  if (typeof value !== "string") return true;

  const dangerous = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ];

  return !dangerous.some((pattern) => pattern.test(value));
};
