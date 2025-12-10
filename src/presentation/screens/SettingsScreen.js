import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { useTheme } from "../../domain/contexts/ThemeContext";
import { useCurrency } from "../../domain/contexts/CurrencyContext";
import { useAuth } from "../../domain/contexts/AuthContext";
import { Card, Button } from "../components";
import { BiometricService } from "../../infrastructure/services/BiometricService";
import { cacheService } from "../../infrastructure/services/CacheStrategyService";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { currency } = useCurrency();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkBiometricStatus();
  }, [user]);

  const checkBiometricStatus = async () => {
    try {
      const { available } = await BiometricService.isAvailable();
      setBiometricAvailable(available);
      
      if (user) {
        const enabled = await BiometricService.isEnabled(user.uid);
        setBiometric(enabled);
      }
    } catch (error) {
      console.error('Erro ao verificar status biométrico:', error);
    }
  };

  const handleBiometricToggle = async (value) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para habilitar a biometria');
      return;
    }

    if (!biometricAvailable) {
      Alert.alert(
        'Biometria não disponível',
        'Seu dispositivo não possui autenticação biométrica ou ela não está configurada.'
      );
      return;
    }

    if (value) {
      // Habilitar biometria - precisa autenticar primeiro
      const authResult = await BiometricService.authenticate({
        promptMessage: 'Autentique-se para habilitar a biometria',
        cancelLabel: 'Cancelar',
      });

      if (!authResult.success) {
        Alert.alert('Erro', 'Autenticação necessária para habilitar biometria');
        return;
      }

      // Verificar se há credenciais salvas
      const existingCredentials = await BiometricService.getCredentials(user.uid);
      
      if (!existingCredentials) {
        // Se não houver credenciais, mostrar modal para pedir senha
        if (Platform.OS === 'ios') {
          // iOS tem Alert.prompt nativo
          Alert.prompt(
            'Salvar Credenciais',
            'Digite sua senha para salvar e habilitar o login biométrico:',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => {},
              },
              {
                text: 'Salvar',
                onPress: async (password) => {
                  if (!password || password.trim() === '') {
                    Alert.alert('Erro', 'Senha não pode estar vazia');
                    return;
                  }
                  await saveBiometricCredentials(password);
                },
              },
            ],
            'secure-text'
          );
        } else {
          // Android - mostrar modal customizado
          setShowPasswordModal(true);
        }
      } else {
        // Se já houver credenciais, apenas habilitar
        await AsyncStorage.setItem(`biometric_enabled_${user.uid}`, 'true');
        setBiometric(true);
        Alert.alert('Sucesso', 'Autenticação biométrica habilitada');
      }
    } else {
      // Desabilitar biometria
      await BiometricService.removeCredentials(user.uid);
      setBiometric(false);
      Alert.alert('Sucesso', 'Autenticação biométrica desabilitada');
    }
  };

  const saveBiometricCredentials = async (passwordToSave) => {
    try {
      if (!passwordToSave || passwordToSave.trim() === '') {
        Alert.alert('Erro', 'Senha não pode estar vazia');
        return;
      }

      // Salvar credenciais com email do usuário logado
      await BiometricService.saveCredentials(
        user.uid,
        user.email,
        passwordToSave
      );
      
      setBiometric(true);
      setShowPasswordModal(false);
      setPassword('');
      Alert.alert('Sucesso', 'Autenticação biométrica habilitada');
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
      Alert.alert('Erro', 'Não foi possível salvar as credenciais');
    }
  };

  const handlePasswordSubmit = () => {
    saveBiometricCredentials(password);
  };

  const handleClearCache = async () => {
    try {
      // Mostrar estatísticas antes de limpar
      const statsBefore = cacheService.getStats();
      
      Alert.alert(
        'Limpar Cache',
        `Tem certeza que deseja limpar todo o cache?\n\nStatus atual:\n• ${statsBefore.total} itens em cache\n• ${statsBefore.valid} válidos\n• ${statsBefore.expired} expirados\n\nIsso pode melhorar a performance, mas os dados precisarão ser recarregados.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Limpar',
            style: 'destructive',
            onPress: async () => {
              try {
                await cacheService.clear();
                const statsAfter = cacheService.getStats();
                Alert.alert(
                  'Sucesso', 
                  `Cache limpo com sucesso!\n\nStatus após limpeza:\n• ${statsAfter.total} itens em cache`
                );
              } catch (error) {
                console.error('Erro ao limpar cache:', error);
                Alert.alert('Erro', 'Não foi possível limpar o cache');
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Erro ao obter estatísticas do cache:', error);
      Alert.alert('Erro', 'Não foi possível verificar o status do cache');
    }
  };

  const handleViewCacheStats = () => {
    try {
      const stats = cacheService.getStats();
      
      if (stats.total === 0) {
        Alert.alert(
          'Status do Cache',
          'Nenhum item em cache no momento.\n\nO cache será preenchido automaticamente quando você usar o aplicativo.'
        );
        return;
      }

      // Agrupar itens por tipo
      const itemsByType = {};
      stats.items.forEach(item => {
        if (!itemsByType[item.type]) {
          itemsByType[item.type] = [];
        }
        itemsByType[item.type].push(item);
      });

      // Criar mensagem detalhada
      let message = `Total: ${stats.total} itens\nVálidos: ${stats.valid}\nExpirados: ${stats.expired}\n\n`;
      message += '━━━━━━━━━━━━━━━━━━━━\n\n';
      
      // Adicionar itens por tipo
      Object.keys(itemsByType).forEach(type => {
        const items = itemsByType[type];
        const validItems = items.filter(i => !i.isExpired);
        const expiredItems = items.filter(i => i.isExpired);
        
        message += `📦 ${type}\n`;
        message += `   • Total: ${items.length}\n`;
        
        if (validItems.length > 0) {
          message += `   • Válidos: ${validItems.length}\n`;
          validItems.forEach(item => {
            const userId = item.key.split('_').pop();
            message += `     ✓ ${item.timeLeft} restantes\n`;
          });
        }
        
        if (expiredItems.length > 0) {
          message += `   • Expirados: ${expiredItems.length}\n`;
        }
        
        message += '\n';
      });

      message += '━━━━━━━━━━━━━━━━━━━━\n\n';
      message += 'O cache é limpo automaticamente quando os itens expiram.';

      Alert.alert('Status do Cache', message);
    } catch (error) {
      console.error('Erro ao obter estatísticas do cache:', error);
      Alert.alert('Erro', 'Não foi possível obter informações do cache');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remover credenciais biométricas ao fazer logout
              if (user) {
                await BiometricService.removeCredentials(user.uid);
                await AsyncStorage.removeItem(`biometric_enabled_${user.uid}`);
                await AsyncStorage.removeItem('last_user_id');
              }
              
              const result = await logout();
              if (!result.success) {
                Alert.alert('Erro', 'Não foi possível sair da conta');
              }
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao sair da conta');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferências
          </Text>
          
          <Card style={styles.settingsCard}>
            <SettingItem
              title="Notificações"
              subtitle="Receber alertas de transações"
              value={notifications}
              onValueChange={setNotifications}
              theme={theme}
            />
            
            <SettingItem
              title="Modo Escuro"
              subtitle="Alternar tema da aplicação"
              value={isDarkMode}
              onValueChange={toggleTheme}
              theme={theme}
            />
            
            <SettingItem
              title="Autenticação Biométrica"
              subtitle={
                !biometricAvailable
                  ? "Não disponível no seu dispositivo"
                  : biometric
                  ? "Usar impressão digital ou Face ID"
                  : "Habilitar autenticação biométrica"
              }
              value={biometric}
              onValueChange={handleBiometricToggle}
              theme={theme}
              disabled={!biometricAvailable || !user}
              isLast
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Financeiro
          </Text>
          
          <Card style={styles.menuCard}>
            <MenuItem
              title="Moeda Padrão"
              subtitle={`${currency.code} (${currency.symbol})`}
              showArrow
              theme={theme}
              onPress={() => navigation.navigate('CurrencySettings')}
            />
            
            <MenuItem
              title="Categorias"
              subtitle="Gerenciar categorias de gastos"
              showArrow
              theme={theme}
              onPress={() => navigation.navigate('Categories')}
            />
            
            <MenuItem
              title="Transações Recorrentes"
              subtitle="Configurar transações automáticas"
              showArrow
              theme={theme}
              onPress={() => navigation.navigate('RecurringTransactions')}
            />
            
            <MenuItem
              title="Exportar Dados"
              subtitle="Baixar relatórios em CSV/Texto"
              showArrow
              theme={theme}
              onPress={() => navigation.navigate('ExportReport')}
              isLast
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Segurança
          </Text>
          
          <Card style={styles.menuCard}>
            <MenuItem
              title="Alterar Senha"
              subtitle="Atualizar senha da conta"
              showArrow
              theme={theme}
            />
            
            <MenuItem
              title="Verificação em Duas Etapas"
              subtitle="Adicionar camada extra de segurança"
              showArrow
              theme={theme}
            />
            
            <MenuItem
              title="Sessões Ativas"
              subtitle="Gerenciar dispositivos conectados"
              showArrow
              theme={theme}
            />
            
            <MenuItem
              title="Sair da Conta"
              subtitle="Fazer logout da aplicação"
              showArrow={false}
              theme={theme}
              onPress={handleLogout}
              isLast
              isDanger
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Suporte
          </Text>
          
          <Card style={styles.menuCard}>
            <MenuItem
              title="Central de Ajuda"
              subtitle="FAQ e tutoriais"
              showArrow
              theme={theme}
            />
            
            <MenuItem
              title="Contato"
              subtitle="Fale conosco"
              showArrow
              theme={theme}
            />
            
            <MenuItem
              title="Termos de Uso"
              subtitle="Condições de uso do app"
              showArrow
              theme={theme}
            />
            
            <MenuItem
              title="Política de Privacidade"
              subtitle="Como tratamos seus dados"
              showArrow
              theme={theme}
            />
            
            <MenuItem
              title="Status do Cache"
              subtitle="Ver informações sobre o cache"
              showArrow={false}
              theme={theme}
              onPress={handleViewCacheStats}
            />
            
            <MenuItem
              title="Limpar Cache"
              subtitle="Remover dados em cache para melhorar performance"
              showArrow={false}
              theme={theme}
              onPress={handleClearCache}
              isLast
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            Versão 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Modal para pedir senha no Android */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPasswordModal(false);
          setPassword('');
        }}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Salvar Credenciais
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Digite sua senha para salvar e habilitar o login biométrico:
            </Text>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Sua senha"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
                style={styles.modalButton}
              />
              <Button
                title="Salvar"
                onPress={handlePasswordSubmit}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
};

const SettingItem = ({ title, subtitle, value, onValueChange, theme, isLast = false, disabled = false }) => (
  <View style={[styles.settingItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, { color: disabled ? theme.colors.textSecondary : theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
      thumbColor={value ? '#FFFFFF' : theme.colors.textSecondary}
    />
  </View>
);

const MenuItem = ({ title, subtitle, showArrow = false, theme, isLast = false, onPress, isDanger = false }) => (
  <TouchableOpacity 
    style={[styles.menuItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuContent}>
      <Text style={[styles.menuTitle, { color: isDanger ? theme.colors.error : theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.menuSubtitle, { color: theme.colors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
    {showArrow && (
      <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>›</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsCard: {
    padding: 0,
  },
  menuCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default SettingsScreen;
