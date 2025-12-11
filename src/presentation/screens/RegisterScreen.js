import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../domain/contexts/ThemeContext";
import { Button } from "../components";
import TextField from "../components/legacy/form/TextField";
import { useRegister } from "../hooks/useRegister";
import { AuthLayout } from "../components/layouts/AuthLayout";

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { control, loading, handleSubmit, validationRules } = useRegister();

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Comece a gerenciar suas finanças hoje"
      formTitle="Registrar"
    >
      <TextField
        control={control}
        validationRules={validationRules}
        name="email"
        label="Email"
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextField
        control={control}
        validationRules={validationRules}
        name="password"
        label="Senha"
        placeholder="Escolha uma senha"
        secureTextEntry
      />

      <TextField
        control={control}
        validationRules={validationRules}
        name="confirmPassword"
        label="Confirmar Senha"
        placeholder="Confirme sua senha"
        secureTextEntry
      />

      <Button
        title="Criar Conta"
        onPress={handleSubmit}
        loading={loading}
        style={styles.registerButton}
      />

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>
          Já tem uma conta?{" "}
          <Text style={[styles.linkTextBold, { color: theme.colors.primary }]}>
            Entre
          </Text>
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  registerButton: {
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

export default RegisterScreen;
