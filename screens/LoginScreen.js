import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import TextField from "../components/form/TextField";
import { useLogin } from "../hooks/useLogin";
import { BiometricService } from "../src/infrastructure/services/BiometricService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { control, loading, handleSubmit, validationRules } = useLogin();
  const { loginWithBiometric } = useAuth();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const { available } = await BiometricService.isAvailable();
      setBiometricAvailable(available);
      console.log('Biometria disponível:', available);
      
      // Verificar se há um último usuário logado com biometria habilitada
      const lastUserId = await AsyncStorage.getItem('last_user_id');
      console.log('Último usuário ID:', lastUserId);
      
      if (lastUserId) {
        const enabled = await BiometricService.isEnabled(lastUserId);
        console.log('Biometria habilitada para usuário:', enabled);
        setBiometricEnabled(enabled);
        
        // Verificar se há credenciais salvas
        const credentials = await BiometricService.getCredentials(lastUserId);
        console.log('Credenciais encontradas:', !!credentials);
      }
    } catch (error) {
      console.error('Erro ao verificar biometria:', error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setBiometricLoading(true);
      const lastUserId = await AsyncStorage.getItem('last_user_id');
      
      if (!lastUserId) {
        Alert.alert('Erro', 'Nenhum usuário encontrado. Faça login primeiro.');
        setBiometricLoading(false);
        return;
      }

      console.log('Iniciando login biométrico para usuário:', lastUserId);
      const result = await loginWithBiometric(lastUserId);
      console.log('Resultado do login biométrico:', result);
      
      if (!result.success) {
        Alert.alert('Erro', result.error || 'Falha na autenticação biométrica');
      }
    } catch (error) {
      console.error('Erro no handleBiometricLogin:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer login com biometria');
    } finally {
      setBiometricLoading(false);
    }
  };

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
                placeholder="Sua senha"
                secureTextEntry
              />

              <Button
                title="Entrar"
                onPress={handleSubmit}
                loading={loading}
                style={styles.loginButton}
              />

              {biometricAvailable && biometricEnabled && (
                <TouchableOpacity
                  style={[styles.biometricButton, { borderColor: theme.colors.primary }]}
                  onPress={handleBiometricLogin}
                  disabled={biometricLoading}
                >
                  <Ionicons 
                    name="finger-print" 
                    size={24} 
                    color={theme.colors.primary} 
                    style={styles.biometricIcon}
                  />
                  <Text style={[styles.biometricText, { color: theme.colors.primary }]}>
                    {biometricLoading ? 'Autenticando...' : 'Entrar com Biometria'}
                  </Text>
                </TouchableOpacity>
              )}

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
                    Registre-se
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
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 12,
    marginBottom: 8,
  },
  biometricIcon: {
    marginRight: 8,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LoginScreen;
