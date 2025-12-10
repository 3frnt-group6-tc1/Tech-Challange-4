import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useAuth } from "../../domain/contexts/AuthContext";
import { useTheme } from "../../domain/contexts/ThemeContext";
import { useTransactions } from "../../domain/contexts/TransactionsContext";
import { useCurrency } from "../../domain/contexts/CurrencyContext";
import { Card, Button, Loading } from "../components";
import UnifiedTransactionModal from "../components/legacy/UnifiedTransactionModal";
import TransactionItem from "../components/legacy/TransactionItem";

const HomeScreen = React.memo(({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { transactions, loading, addTransaction, getTotalByType, getBalance } =
    useTransactions();
  const { formatCurrency } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("income");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Memoize user name extraction
  const firstName = useMemo(() => {
    if (!user?.email) return "Usuário";
    const name = user.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user?.email]);

  // Memoize financial calculations
  const financialData = useMemo(() => {
    const incomeTotal = getTotalByType("income");
    const expenseTotal = getTotalByType("expense");
    const balanceTotal = getBalance();

    return {
      incomeTotal,
      expenseTotal,
      balanceTotal,
    };
  }, [getTotalByType, getBalance]);

  // Memoize recent transactions (showing only last 5)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const handleAddPress = useCallback((type) => {
    setModalType(type);
    setModalVisible(true);
  }, []);

  const handleSaveTransaction = useCallback(
    async (newTransaction) => {
      try {
        await addTransaction(newTransaction);
      } catch (error) {
        console.error("Erro ao adicionar transação:", error);
      }
    },
    [addTransaction]
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleNavigateToTransactions = useCallback(() => {
    navigation.navigate("Transactions");
  }, [navigation]);

  if (loading) {
    return <Loading message="Carregando suas transações..." />;
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
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Olá, {firstName}!</Text>
            <Text style={styles.subtitle}>Como estão suas finanças hoje?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Card style={styles.balanceCard}>
              <Text
                style={[
                  styles.balanceLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Saldo Total
              </Text>
              <Text style={[styles.balance, { color: theme.colors.text }]}>
                {formatCurrency(financialData.balanceTotal)}
              </Text>
            </Card>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(150).duration(600)}
            style={styles.actionsContainer}
          >
            <Button
              title="Adicionar Receita"
              variant="success"
              style={styles.actionButton}
              onPress={() => handleAddPress("income")}
            />

            <Button
              title="Adicionar Despesa"
              variant="danger"
              style={styles.actionButton}
              onPress={() => handleAddPress("expense")}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.summaryRow}
          >
            <Card style={styles.summaryCard}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Receitas
              </Text>
              <Text
                style={[styles.summaryAmount, { color: theme.colors.success }]}
              >
                {formatCurrency(financialData.incomeTotal)}
              </Text>
            </Card>

            <Card style={styles.summaryCard}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Despesas
              </Text>
              <Text
                style={[styles.summaryAmount, { color: theme.colors.error }]}
              >
                {formatCurrency(financialData.expenseTotal)}
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(300).duration(600)}>
            <Card>
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  Transações Recentes
                </Text>
                <TouchableOpacity onPress={handleNavigateToTransactions}>
                  <Text
                    style={[styles.seeAllText, { color: theme.colors.primary }]}
                  >
                    Ver todas
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.transactionsList}>
                {recentTransactions.length === 0 ? (
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Nenhuma transação ainda
                  </Text>
                ) : (
                  recentTransactions.map((t, idx) => (
                    <TransactionItem
                      key={t.id ? `${t.id}-${idx}` : `transaction-${idx}`}
                      transaction={t}
                      showImageButton={true}
                      showEditButton={false}
                      showDescription={false}
                    />
                  ))
                )}
              </View>
            </Card>
          </Animated.View>

          <UnifiedTransactionModal
            visible={modalVisible}
            onClose={handleCloseModal}
            onSave={handleSaveTransaction}
            type={modalType}
          />
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  balanceCard: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  balanceChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 20,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  transactionsList: {
    gap: 12,
  },
});

export default HomeScreen;
