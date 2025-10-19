import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card } from '../components/Card';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { currency } = useCurrency();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);

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
              subtitle="Usar impressão digital ou Face ID"
              value={biometric}
              onValueChange={setBiometric}
              theme={theme}
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
              isLast
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
    </View>
  );
};

const SettingItem = ({ title, subtitle, value, onValueChange, theme, isLast = false }) => (
  <View style={[styles.settingItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
      thumbColor={value ? '#FFFFFF' : theme.colors.textSecondary}
    />
  </View>
);

const MenuItem = ({ title, subtitle, showArrow = false, theme, isLast = false, onPress }) => (
  <TouchableOpacity 
    style={[styles.menuItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuContent}>
      <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
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
});

export default SettingsScreen;
