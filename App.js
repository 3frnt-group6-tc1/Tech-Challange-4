import React, { useEffect, lazy, Suspense } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StatusBar } from "react-native";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { TransactionsProvider } from "./contexts/TransactionsContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { cacheService } from "./src/infrastructure/services";
import LoadingScreen from "./components/LoadingScreen";

// Lazy load screens for better performance
const LoginScreen = lazy(() => import("./screens/LoginScreen"));
const RegisterScreen = lazy(() => import("./screens/RegisterScreen"));
const HomeScreen = lazy(() => import("./screens/HomeScreen"));
const DashboardScreen = lazy(() => import("./screens/DashboardScreen"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen"));
const SettingsScreen = lazy(() => import("./screens/SettingsScreen"));
const TransactionsScreen = lazy(() => import("./screens/TransactionsScreen"));
const CategoriesScreen = lazy(() => import("./screens/CategoriesScreen"));
const RecurringTransactionsScreen = lazy(() =>
  import("./screens/RecurringTransactionsScreen")
);
const ExportReportScreen = lazy(() => import("./screens/ExportReportScreen"));
const CurrencySettingsScreen = lazy(() =>
  import("./screens/CurrencySettingsScreen")
);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando autenticação..." />}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </Suspense>
  );
};

const MainTabs = () => {
  const { theme } = useTheme();

  return (
    <Suspense fallback={<LoadingScreen message="Carregando aplicação..." />}>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
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
                  fontWeight: "bold",
                  fontSize: 18,
                },
              }}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: "Início",
                  tabBarLabel: "Início",
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
                  title: "Dashboard",
                  tabBarLabel: "Dashboard",
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
                  title: "Perfil",
                  tabBarLabel: "Perfil",
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
                  title: "Configurações",
                  tabBarLabel: "Config",
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
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="RecurringTransactions"
          component={RecurringTransactionsScreen}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="ExportReport"
          component={ExportReportScreen}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="CurrencySettings"
          component={CurrencySettingsScreen}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </Suspense>
  );
};

const AppNavigator = () => {
  const { user, loading, preloadComplete } = useAuth();
  const { theme, isDarkMode } = useTheme();

  if (loading) {
    return <LoadingScreen message="Carregando aplicação..." />;
  }

  // Show loading while preloading user data
  if (user && !preloadComplete) {
    return <LoadingScreen message="Preparando seus dados..." />;
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
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
      console.error("Erro ao inicializar cache service:", error);
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <TransactionsProvider>
            <AppNavigator />
          </TransactionsProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
