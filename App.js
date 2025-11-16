import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StatusBar } from 'react-native';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { cacheService } from './src/infrastructure/services';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import RecurringTransactionsScreen from './screens/RecurringTransactionsScreen';
import ExportReportScreen from './screens/ExportReportScreen';
import CurrencySettingsScreen from './screens/CurrencySettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        options={{ headerShown: false }}
      >
        {() => (
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.textSecondary,
              tabBarStyle: {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.border,
                paddingBottom: 5,
                height: 85,
              },
              headerStyle: {
                backgroundColor: theme.colors.surface,
                shadowColor: theme.colors.shadow,
                elevation: 0,
              },
              headerTintColor: theme.colors.text,
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
              },
            }}
          >
            <Tab.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                title: 'Início',
                tabBarLabel: 'Início',
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 22 }}>🏠</Text>
                ),
                headerShown: false,
              }}
            />
            <Tab.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{
                title: 'Dashboard',
                tabBarLabel: 'Dashboard',
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 22 }}>📊</Text>
                ),
                headerShown: false,
              }}
            />
            <Tab.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{
                title: 'Perfil',
                tabBarLabel: 'Perfil',
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 22 }}>👤</Text>
                ),
                headerShown: false,
              }}
            />
            <Tab.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                title: 'Configurações',
                tabBarLabel: 'Config',
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 22 }}>⚙️</Text>
                ),
              }}
            />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Transactions" 
        component={TransactionsScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="RecurringTransactions" 
        component={RecurringTransactionsScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="ExportReport" 
        component={ExportReportScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="CurrencySettings" 
        component={CurrencySettingsScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { theme, isDarkMode } = useTheme();

  if (loading) {
    return null;
  }

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      <NavigationContainer>
        {user ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </>
  );
};

const App = () => {
  // Inicializar cache service na inicialização do app
  useEffect(() => {
    cacheService.initialize().catch((error) => {
      console.error('Erro ao inicializar cache service:', error);
    });
  }, []);

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <TransactionsProvider>
            <AppNavigator />
          </TransactionsProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
};

export default App;