import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const getFirstName = (email) => {
    if (!email) return 'Usuário';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
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
            const result = await logout();
            if (!result.success) {
              Alert.alert('Erro', 'Não foi possível sair da conta');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {getFirstName(user?.email)}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.memberSince}>
            Membro desde {new Date().getFullYear()}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Conta
          </Text>
          
          <ProfileMenuItem
            title="Editar Perfil"
            subtitle="Nome, foto e informações pessoais"
            theme={theme}
          />
          
          <ProfileMenuItem
            title="Configurações de Conta"
            subtitle="Preferências e privacidade"
            theme={theme}
          />
          
          <ProfileMenuItem
            title="Alterar Senha"
            subtitle="Atualizar senha de acesso"
            theme={theme}
            isLast
          />
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Suporte
          </Text>
          
          <ProfileMenuItem
            title="Ajuda e Suporte"
            subtitle="FAQ e atendimento"
            theme={theme}
          />
          
          <ProfileMenuItem
            title="Sobre o App"
            subtitle="Versão e informações"
            theme={theme}
            isLast
          />
        </Card>

        <Card style={styles.logoutCard}>
          <Button
            title="Sair da Conta"
            variant="danger"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </Card>
      </ScrollView>
      </View>
    </View>
  );
};

const ProfileMenuItem = ({ title, subtitle, theme, isLast = false, onPress }) => (
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
    <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
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
  logoutCard: {
    marginTop: 16,
  },
  logoutButton: {
    marginVertical: 8,
  },
});

export default ProfileScreen;
