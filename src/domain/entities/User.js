/**
 * Entidade User - Representa um usuário do sistema
 * @class User
 */
export class User {
  /**
   * @param {Object} data - Dados do usuário
   * @param {string} data.id - ID único do usuário (Firebase UID)
   * @param {string} data.email - Email do usuário
   * @param {string} [data.displayName] - Nome de exibição
   * @param {string} [data.photoURL] - URL da foto de perfil
   * @param {string} [data.currency] - Moeda preferida (default: BRL)
   * @param {string} [data.theme] - Tema preferido (light/dark)
   * @param {boolean} [data.biometricEnabled] - Se biometria está habilitada
   * @param {boolean} [data.notificationsEnabled] - Se notificações estão habilitadas
   */
  constructor({
    id,
    email,
    displayName = null,
    photoURL = null,
    currency = "BRL",
    theme = "light",
    biometricEnabled = false,
    notificationsEnabled = true,
    createdAt = null,
    lastLoginAt = null,
  }) {
    this.id = id;
    this.email = email;
    this.displayName = displayName || email?.split("@")[0] || "Usuário";
    this.photoURL = photoURL;
    this.currency = currency;
    this.theme = theme;
    this.biometricEnabled = biometricEnabled;
    this.notificationsEnabled = notificationsEnabled;
    this.createdAt = createdAt || new Date().toISOString();
    this.lastLoginAt = lastLoginAt || new Date().toISOString();
  }

  /**
   * Valida se o usuário possui dados válidos
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push("ID é obrigatório");
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push("Email inválido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida formato de email
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Retorna as iniciais do nome para avatar
   * @returns {string}
   */
  getInitials() {
    if (!this.displayName) return "U";
    
    const names = this.displayName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Verifica se o tema é escuro
   * @returns {boolean}
   */
  isDarkMode() {
    return this.theme === "dark";
  }

  /**
   * Atualiza as preferências do usuário
   * @param {Object} preferences
   * @returns {User}
   */
  updatePreferences(preferences) {
    return new User({
      ...this.toPlainObject(),
      ...preferences,
    });
  }

  /**
   * Converte para objeto plano (para Firestore)
   * @returns {Object}
   */
  toPlainObject() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      currency: this.currency,
      theme: this.theme,
      biometricEnabled: this.biometricEnabled,
      notificationsEnabled: this.notificationsEnabled,
      createdAt: this.createdAt,
      lastLoginAt: this.lastLoginAt,
    };
  }

  /**
   * Cria um User a partir de um objeto Firebase Auth
   * @param {Object} firebaseUser - Usuário do Firebase Auth
   * @param {Object} [preferences] - Preferências adicionais
   * @returns {User}
   */
  static fromFirebaseUser(firebaseUser, preferences = {}) {
    return new User({
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      ...preferences,
    });
  }

  /**
   * Cria um User a partir de um objeto plano
   * @param {Object} data
   * @returns {User}
   */
  static fromPlainObject(data) {
    return new User(data);
  }
}

export default User;

