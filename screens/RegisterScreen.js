import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import TextField from "../components/form/TextField";
import { useRegister } from "../hooks/useRegister";

const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { control, loading, handleSubmit, validationRules } = useRegister();

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
          Crie sua conta
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: "rgba(255, 255, 255, 0.8)" }]}
        >
          Comece a gerenciar suas finanças hoje
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
                Registrar
              </Text>

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
                <Text
                  style={[
                    styles.linkText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Já tem uma conta?{" "}
                  <Text
                    style={[
                      styles.linkTextBold,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Entre
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
