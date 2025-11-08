import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Controller } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ValidatedInput from "../components/ValidatedInput";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useFormValidation } from "../hooks/useFormValidation";
import { validationSets } from "../utils/validationRules";

/**
 * Enhanced LoginScreen using the centralized validation system
 * This example demonstrates how to use the useFormValidation hook
 * with automatic sanitization and centralized validation rules
 */
const EnhancedLoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { theme } = useTheme();

  // Setup form validation with centralized rules
  const {
    control,
    handleSubmit,
    getFieldProps,
    errors,
    isSubmitting,
    canSubmit,
    formStats,
  } = useFormValidation({
    defaultValues: {
      email: "",
      password: "",
    },
    validationRules: validationSets.login,
    onSubmit: handleLoginSubmit,
    sanitizeOnChange: true, // Automatic input sanitization
  });

  async function handleLoginSubmit(sanitizedData) {
    const result = await login(sanitizedData.email, sanitizedData.password);

    if (!result.success) {
      Alert.alert("Erro de Login", result.error);
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.headerTitle, { color: "#FFFFFF" }]}>
          Bem-vindo de volta!
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: "rgba(255, 255, 255, 0.8)" }]}
        >
          Entre na sua conta para continuar
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.formCard}>
              <Text style={[styles.formTitle, { color: theme.colors.text }]}>
                Entrar
              </Text>

              {/* Email field with validation */}
              <Controller
                {...getFieldProps("email")}
                render={({ value, onChange, onBlur, error, hasError }) => (
                  <ValidatedInput
                    label="Email"
                    placeholder="seu@email.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={error}
                    hasError={hasError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />

              {/* Password field with validation */}
              <Controller
                {...getFieldProps("password")}
                render={({ value, onChange, onBlur, error, hasError }) => (
                  <ValidatedInput
                    label="Senha"
                    placeholder="Sua senha"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={error}
                    hasError={hasError}
                    secureTextEntry
                  />
                )}
              />

              {/* Form statistics (for debugging - remove in production) */}
              {__DEV__ && (
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Errors: {formStats.errorCount} | Valid:{" "}
                  {formStats.isValid ? "Yes" : "No"} | Dirty:{" "}
                  {formStats.isDirty ? "Yes" : "No"}
                </Text>
              )}

              <Button
                title="Entrar"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={!canSubmit}
                style={styles.loginButton}
              />

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate("Register")}
              >
                <Text
                  style={[
                    styles.linkText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Não tem uma conta?{" "}
                  <Text
                    style={[
                      styles.linkTextBold,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Cadastre-se
                  </Text>
                </Text>
              </TouchableOpacity>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  formCard: {
    marginTop: 0,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
    textAlign: "center",
  },
  linkTextBold: {
    fontWeight: "bold",
  },
});

export default EnhancedLoginScreen;
