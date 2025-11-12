import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useFormValidation } from "./useFormValidation";
import { formValidationSets } from "../utils/formFieldRules";

/**
 * Custom hook for login screen
 * Handles login form state, validation, and submission
 */
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  /**
   * Handle login submission
   */
  const onSubmit = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const result = await login(data.email, data.password);

        if (!result.success) {
          Alert.alert("Erro de Login", result.error);
        }
      } catch (error) {
        Alert.alert("Erro", "Ocorreu um erro inesperado. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  // Initialize form with validation
  const { control, handleSubmit, errors } = useFormValidation({
    defaultValues: {
      email: "",
      password: "",
    },
    validationRules: formValidationSets.login,
    onSubmit,
  });

  return {
    control,
    errors,
    loading,
    handleSubmit,
    validationRules: formValidationSets.login,
  };
};
