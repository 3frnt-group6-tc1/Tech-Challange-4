import { fieldValidators } from "./fieldRules";

/**
 * Form validation sets
 * Combines field validators into complete form validation schemas
 */

/**
 * Predefined validation sets for common forms
 */
export const formValidationSets = {
  /**
   * Login form validation
   */
  login: {
    email: fieldValidators.email(),
    password: fieldValidators.password(),
  },

  /**
   * Registration form validation
   * @param {string} passwordValue - Current password value for confirmation
   * @returns {Object} - Complete form validation schema
   */
  register: (passwordValue) => ({
    email: fieldValidators.email(),
    password: fieldValidators.password(),
    confirmPassword: fieldValidators.confirmPassword(passwordValue),
  }),

  /**
   * Transaction form validation
   * @param {Array} categories - Available categories
   * @param {Function} parseCurrency - Currency parsing function
   * @returns {Object} - Complete form validation schema
   */
  transaction: (categories = [], parseCurrency) => ({
    title: fieldValidators.title(),
    description: fieldValidators.description(),
    amount: fieldValidators.currency(parseCurrency),
    category: fieldValidators.category(categories),
    date: fieldValidators.date(),
  }),

  /**
   * Recurring transaction form validation
   * @param {Array} categories - Available categories
   * @param {Function} parseCurrency - Currency parsing function
   * @returns {Object} - Complete form validation schema
   */
  recurringTransaction: (categories = [], parseCurrency) => ({
    title: fieldValidators.title(),
    description: fieldValidators.description(),
    amount: fieldValidators.currency(parseCurrency),
    category: fieldValidators.category(categories),
    frequency: fieldValidators.frequency(),
    nextDueDate: fieldValidators.date("Data de vencimento é obrigatória"),
  }),

  /**
   * Profile form validation
   * @returns {Object} - Complete form validation schema
   */
  profile: () => ({
    name: fieldValidators.text(2, 100, true, "Nome"),
    email: fieldValidators.email(),
  }),

  /**
   * Settings form validation
   * @returns {Object} - Complete form validation schema
   */
  settings: () => ({
    currency: fieldValidators.required("Moeda é obrigatória"),
    theme: fieldValidators.required("Tema é obrigatório"),
  }),

  /**
   * Category management form validation
   * @returns {Object} - Complete form validation schema
   */
  category: () => ({
    name: fieldValidators.text(2, 50, true, "Nome da categoria"),
    type: fieldValidators.required("Tipo é obrigatório"),
  }),

  /**
   * Export/Report form validation
   * @returns {Object} - Complete form validation schema
   */
  export: () => ({
    startDate: fieldValidators.date("Data inicial é obrigatória"),
    endDate: fieldValidators.date("Data final é obrigatória"),
    format: fieldValidators.required("Formato é obrigatório"),
  }),
};