import React, { createContext, useState, useContext, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../../firebase.config";
import { BiometricService } from "../../infrastructure/services/BiometricService";
import { PreloaderService } from "../../infrastructure/services/PreloaderService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preloadComplete, setPreloadComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // Pre-load critical data when user logs in
      if (user) {
        try {
          console.log("AuthContext: Starting data preload for user", user.uid);
          const preloadResult = await PreloaderService.preloadCriticalData(
            user.uid
          );

          if (preloadResult.success) {
            console.log(
              "AuthContext: Preload completed successfully",
              preloadResult.summary
            );
          } else {
            console.warn("AuthContext: Preload failed", preloadResult.error);
          }

          setPreloadComplete(true);
        } catch (error) {
          console.error("AuthContext: Error during preload", error);
          setPreloadComplete(true); // Continue even if preload fails
        }
      } else {
        setPreloadComplete(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Salvar ID do último usuário logado e credenciais se biometria estiver habilitada
      if (userCredential.user) {
        await AsyncStorage.setItem("last_user_id", userCredential.user.uid);

        // Salvar credenciais para biometria se o usuário quiser
        const biometricEnabled = await BiometricService.isEnabled(
          userCredential.user.uid
        );
        if (biometricEnabled) {
          await BiometricService.saveCredentials(
            userCredential.user.uid,
            email,
            password
          );
        }
      }

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithBiometric = async (userId) => {
    try {
      const result = await BiometricService.loginWithBiometric(userId, login);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    loginWithBiometric,
    register,
    logout,
    loading,
    preloadComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
