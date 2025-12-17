import { fieldValidators } from "./fieldRules";

export const formValidationSets = {
  login: {
    email: fieldValidators.email(),
    password: fieldValidators.password(),
  },

  register: (passwordValue) => ({
    email: fieldValidators.email(),
    password: fieldValidators.password(),
    confirmPassword: fieldValidators.confirmPassword(passwordValue),
  }),

  transaction: (categories = [], parseCurrency) => ({
    title: fieldValidators.title(),
    description: fieldValidators.description(),
    amount: fieldValidators.currency(parseCurrency),
    category: fieldValidators.category(categories),
    date: fieldValidators.date(),
  }),

  recurringTransaction: (categories = [], parseCurrency) => ({
    title: fieldValidators.title(),
    description: fieldValidators.description(),
    amount: fieldValidators.currency(parseCurrency),
    category: fieldValidators.category(categories),
    frequency: fieldValidators.frequency(),
    nextDueDate: fieldValidators.date("Data de vencimento é obrigatória"),
  }),

  profile: () => ({
    name: fieldValidators.text(2, 100, true, "Nome"),
    email: fieldValidators.email(),
  }),

  settings: () => ({
    currency: fieldValidators.required("Moeda é obrigatória"),
    theme: fieldValidators.required("Tema é obrigatório"),
  }),

  category: () => ({
    name: fieldValidators.text(2, 50, true, "Nome da categoria"),
    type: fieldValidators.required("Tipo é obrigatório"),
  }),

  export: () => ({
    startDate: fieldValidators.date("Data inicial é obrigatória"),
    endDate: fieldValidators.date("Data final é obrigatória"),
    format: fieldValidators.required("Formato é obrigatório"),
  }),
};