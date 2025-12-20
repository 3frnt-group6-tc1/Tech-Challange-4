/**
 * Entidade Category - Representa uma categoria de transação
 * @class Category
 */
export class Category {
  /**
   * @param {Object} data - Dados da categoria
   * @param {string} data.id - ID único da categoria
   * @param {string} data.name - Nome da categoria
   * @param {string} data.type - Tipo: 'income' ou 'expense'
   * @param {string} [data.icon] - Ícone/emoji da categoria
   * @param {string} [data.color] - Cor da categoria (hex)
   * @param {boolean} [data.isDefault] - Se é uma categoria padrão do sistema
   * @param {string} [data.userId] - ID do usuário (null para categorias padrão)
   */
  constructor({
    id,
    name,
    type,
    icon = null,
    color = null,
    isDefault = false,
    userId = null,
    createdAt = null,
  }) {
    this.id = id || this.generateId(name);
    this.name = name?.trim() || "";
    this.type = type; // 'income' | 'expense'
    this.icon = icon || this.getDefaultIcon(name);
    this.color = color || this.getDefaultColor(type);
    this.isDefault = isDefault;
    this.userId = userId;
    this.createdAt = createdAt || new Date().toISOString();
  }

  /**
   * Gera um ID baseado no nome
   * @param {string} name
   * @returns {string}
   */
  generateId(name) {
    return name?.toLowerCase().replace(/\s+/g, "_") || `cat_${Date.now()}`;
  }

  /**
   * Retorna um ícone padrão baseado no nome da categoria
   * @param {string} name
   * @returns {string}
   */
  getDefaultIcon(name) {
    const iconMap = {
      // Despesas
      alimentação: "🍔",
      transporte: "🚗",
      moradia: "🏠",
      saúde: "💊",
      lazer: "🎮",
      educação: "📚",
      compras: "🛒",
      viagem: "✈️",
      // Receitas
      salário: "💰",
      freelance: "💻",
      investimentos: "📈",
      vendas: "🏷️",
      // Padrão
      outros: "📋",
    };

    const normalizedName = name?.toLowerCase() || "";
    return iconMap[normalizedName] || "📋";
  }

  /**
   * Retorna uma cor padrão baseado no tipo
   * @param {string} type
   * @returns {string}
   */
  getDefaultColor(type) {
    return type === "income" ? "#4CAF50" : "#F44336";
  }

  /**
   * Valida se a categoria possui dados válidos
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.length < 1) {
      errors.push("Nome é obrigatório");
    }

    if (this.name && this.name.length > 50) {
      errors.push("Nome deve ter no máximo 50 caracteres");
    }

    if (!this.type || !["income", "expense"].includes(this.type)) {
      errors.push("Tipo deve ser 'income' ou 'expense'");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Verifica se é uma categoria de despesa
   * @returns {boolean}
   */
  isExpenseCategory() {
    return this.type === "expense";
  }

  /**
   * Verifica se é uma categoria de receita
   * @returns {boolean}
   */
  isIncomeCategory() {
    return this.type === "income";
  }

  /**
   * Converte para objeto plano
   * @returns {Object}
   */
  toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      icon: this.icon,
      color: this.color,
      isDefault: this.isDefault,
      userId: this.userId,
      createdAt: this.createdAt,
    };
  }

  /**
   * Cria uma Category a partir de um objeto plano
   * @param {Object} data
   * @returns {Category}
   */
  static fromPlainObject(data) {
    return new Category(data);
  }

  /**
   * Cria categorias padrão do sistema
   * @returns {Object} { income: Category[], expense: Category[] }
   */
  static getDefaultCategories() {
    const incomeCategories = [
      new Category({ name: "Salário", type: "income", isDefault: true }),
      new Category({ name: "Freelance", type: "income", isDefault: true }),
      new Category({ name: "Investimentos", type: "income", isDefault: true }),
      new Category({ name: "Vendas", type: "income", isDefault: true }),
      new Category({ name: "Outros", type: "income", isDefault: true }),
    ];

    const expenseCategories = [
      new Category({ name: "Alimentação", type: "expense", isDefault: true }),
      new Category({ name: "Transporte", type: "expense", isDefault: true }),
      new Category({ name: "Moradia", type: "expense", isDefault: true }),
      new Category({ name: "Saúde", type: "expense", isDefault: true }),
      new Category({ name: "Lazer", type: "expense", isDefault: true }),
      new Category({ name: "Outros", type: "expense", isDefault: true }),
    ];

    return {
      income: incomeCategories,
      expense: expenseCategories,
    };
  }
}

export default Category;

