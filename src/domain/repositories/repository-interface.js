// Interfaces de repositórios (abstrai operações de dados)

// Interface base para todos os repositórios
export class IRepository {
  async findAll() {
    throw new Error("Method findAll() not implemented");
  }

  async findById(id) {
    throw new Error("Method findById() not implemented");
  }

  async create(data) {
    throw new Error("Method create() not implemented");
  }

  async update(id, data) {
    throw new Error("Method update() not implemented");
  }

  async delete(id) {
    throw new Error("Method delete() not implemented");
  }

  async findBy(query) {
    throw new Error("Method findBy() not implemented");
  }
}

// Interface para repositório de transações
export class ITransactionRepository extends IRepository {
  async findByUserId(userId) {
    throw new Error("Method findByUserId() not implemented");
  }

  async findByType(userId, type) {
    throw new Error("Method findByType() not implemented");
  }

  async findByDateRange(userId, startDate, endDate) {
    throw new Error("Method findByDateRange() not implemented");
  }

  /**
   * Finds recurring transactions
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Recurring transactions
   */
  async findRecurring(userId) {
    throw new Error("Method findRecurring() not implemented");
  }
}

// Interface para repositório de categorias
export class ICategoryRepository {
  async getUserCategories(userId) {
    throw new Error("Method getUserCategories() not implemented");
  }

  async updateUserCategories(userId, categories) {
    throw new Error("Method updateUserCategories() not implemented");
  }

  async addCategory(userId, type, name) {
    throw new Error("Method addCategory() not implemented");
  }


  async removeCategory(userId, type, name) {
    throw new Error("Method removeCategory() not implemented");
  }
}

// Interface para repositório de configurações de usuário
export class IUserSettingsRepository {
  async getUserSettings(userId) {
    throw new Error("Method getUserSettings() not implemented");
  }

  async updateUserSettings(userId, settings) {
    throw new Error("Method updateUserSettings() not implemented");
  }
}
