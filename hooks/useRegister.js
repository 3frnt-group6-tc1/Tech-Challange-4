import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useFormValidation } from "./useFormValidation";
import { formValidationSets } from "../utils/formFieldRules";

/**
 * Custom hook for register screen
 * Handles registration form state, validation, and submission
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  /**
   * Handle registration submission
   */
  const onSubmit = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const result = await register(data.email, data.password);

        if (!result.success) {
          Alert.alert("Erro de Registro", result.error);
        } else {
          Alert.alert("Sucesso", "Conta criada com sucesso!");
        }
      } catch (error) {
        Alert.alert("Erro", "Ocorreu um erro inesperado. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [register]
  );

  // Watch password field for validation of confirmPassword
  const { control, handleSubmit, errors, watch } = useFormValidation({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit,
  });

  // Get current password value for confirmPassword validation
  const passwordValue = watch("password");

  // Get validation rules with password dependency
  const validationRules = formValidationSets.register(passwordValue);

  return {
    control,
    errors,
    loading,
    handleSubmit,
    validationRules,
  };
};
