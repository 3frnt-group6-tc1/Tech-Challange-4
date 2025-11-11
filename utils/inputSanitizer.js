/**
 * Input sanitization utilities
 * Handles cleaning and validating user input to prevent XSS and ensure data integrity
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

  return result;
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
 * Creates a validation function that checks if input is sanitized
 * @param {string} message - Error message if validation fails
 * @returns {Function} - Validation function
 */
export const createSanitizationValidator = (
  message = "Contém caracteres inválidos"
) => {
  return (value) => {
    if (typeof value !== "string") return true;
    const sanitized = sanitizeInput(value);
    return sanitized === value || message;
  };
};

/**
 * Normalizes text input by trimming and converting to lowercase
 * @param {string} input - Input to normalize
 * @returns {string} - Normalized input
 */
export const normalizeText = (input) => {
  if (typeof input !== "string") return input;
  return input.trim().toLowerCase();
};

/**
 * Normalizes currency input by removing non-numeric characters
 * @param {string} input - Currency input to normalize
 * @returns {string} - Normalized numeric string
 */
export const normalizeCurrency = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/[^\d.,]/g, "").replace(",", ".");
};
