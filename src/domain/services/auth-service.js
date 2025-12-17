export class AuthService {
  constructor(firebaseAuth) {
    this.auth = firebaseAuth;
  }

  async signInWithEmailAndPassword(email, password) {
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      return {
        success: false,
        error: this._formatError(error),
      };
    }
  }

  async createUserWithEmailAndPassword(email, password) {
    try {
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      return {
        success: false,
        error: this._formatError(error),
      };
    }
  }

  async signOut() {
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(this.auth);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this._formatError(error),
      };
    }
  }

  async sendPasswordResetEmail(email) {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(this.auth, email);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this._formatError(error),
      };
    }
  }

  async updateEmail(newEmail) {
    try {
      const { updateEmail } = await import("firebase/auth");
      const user = this.auth.currentUser;

      if (!user) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      await updateEmail(user, newEmail);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this._formatError(error),
      };
    }
  }

  async updatePassword(newPassword) {
    try {
      const { updatePassword } = await import("firebase/auth");
      const user = this.auth.currentUser;

      if (!user) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      await updatePassword(user, newPassword);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this._formatError(error),
      };
    }
  }

  async reauthenticate(password) {
    try {
      const { EmailAuthProvider, reauthenticateWithCredential } = await import(
        "firebase/auth"
      );
      const user = this.auth.currentUser;

      if (!user || !user.email) {
        return {
          success: false,
          error: "Usuário não autenticado",
        };
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this._formatError(error),
      };
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  isAuthenticated() {
    return !!this.auth.currentUser;
  }

  onAuthStateChanged(callback) {
    const { onAuthStateChanged } = require("firebase/auth");
    return onAuthStateChanged(this.auth, callback);
  }

  _formatError(error) {
    // NOSONAR - These are Firebase error codes, not hardcoded passwords
    const errorMessages = {
      "auth/user-not-found": "Usuário não encontrado",
      "auth/wrong-password": "Senha incorreta", // NOSONAR
      "auth/email-already-in-use": "Email já está em uso",
      "auth/weak-password": "Senha muito fraca. Use no mínimo 6 caracteres", // NOSONAR
      "auth/invalid-email": "Email inválido",
      "auth/user-disabled": "Usuário desabilitado",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde",
      "auth/network-request-failed": "Erro de conexão. Verifique sua internet",
      "auth/requires-recent-login":
        "Esta operação requer autenticação recente. Faça login novamente",
    };

    return errorMessages[error.code] || error.message || "Erro desconhecido";
  }
}

export const createAuthService = (firebaseAuth) => {
  return new AuthService(firebaseAuth);
};
