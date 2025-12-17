export const VALIDATION_TYPES = {
  REQUIRED: "required",
  MIN_LENGTH: "minLength",
  MAX_LENGTH: "maxLength",
  PATTERN: "pattern",
  CUSTOM: "custom",
  EMAIL: "email",
  CURRENCY: "currency",
  PHONE: "phone",
};

export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[\d\s\-\(\)]+$/,
  CURRENCY: /^\d+([.,]\d{1,2})?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
};

class ValidationService {
  validateField(value, rule) {
    if (rule.required && !this.isPresent(value)) {
      return {
        isValid: false,
        error: rule.message || "Campo obrigatório",
      };
    }

    if (!this.isPresent(value)) {
      return { isValid: true, error: null };
    }

    if (rule.minLength && value.length < rule.minLength) {
      return {
        isValid: false,
        error: rule.message || `Mínimo ${rule.minLength} caracteres`,
      };
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        isValid: false,
        error: rule.message || `Máximo ${rule.maxLength} caracteres`,
      };
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return {
        isValid: false,
        error: rule.message || "Formato inválido",
      };
    }

    if (rule.custom && typeof rule.custom === "function") {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        return {
          isValid: false,
          error: typeof customResult === "string" ? customResult : rule.message,
        };
      }
    }

    return { isValid: true, error: null };
  }

  validate(data, rules) {
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach((fieldName) => {
      const fieldValue = data[fieldName];
      const fieldRule = rules[fieldName];

      const result = this.validateField(fieldValue, fieldRule);

      if (!result.isValid) {
        errors[fieldName] = result.error;
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  isValidEmail(email) {
    return VALIDATION_PATTERNS.EMAIL.test(email);
  }

  isValidCurrency(value) {
    return VALIDATION_PATTERNS.CURRENCY.test(value);
  }

  isPresent(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  createRule(config) {
    return {
      required: config.required || false,
      minLength: config.minLength,
      maxLength: config.maxLength,
      pattern: config.pattern,
      custom: config.custom,
      message: config.message,
    };
  }
}

export const validationService = new ValidationService();

export const COMMON_RULES = {
  email: {
    required: true,
    pattern: VALIDATION_PATTERNS.EMAIL,
    message: "Email inválido",
  },
  password: {
    required: true,
    minLength: 6,
    message: "Senha deve ter no mínimo 6 caracteres",
  },
  currency: {
    required: true,
    pattern: VALIDATION_PATTERNS.CURRENCY,
    message: "Valor inválido",
  },
  description: {
    required: true,
    minLength: 3,
    maxLength: 500,
    message: "Descrição deve ter entre 3 e 500 caracteres",
  },
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: "Título deve ter entre 3 e 100 caracteres",
  },
  category: {
    required: true,
    message: "Categoria é obrigatória",
  },
};
