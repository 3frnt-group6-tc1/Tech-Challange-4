import React, { useState, useCallback } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useTransactions } from "../contexts/TransactionsContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import UnifiedTransactionModal from "../components/UnifiedTransactionModal";
import TransactionItem from "../components/TransactionItem";

const HomeScreen = ({ navigation }) => {
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

  const getFirstName = (email) => {
    if (!email) return "Usuário";
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const incomeTotal = getTotalByType("income");
  const expenseTotal = getTotalByType("expense");
  const balanceTotal = getBalance();

  const handleAddPress = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleSaveTransaction = async (newTransaction) => {
    try {
      await addTransaction(newTransaction);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
    }
  };

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
            <Text style={styles.welcomeText}>
              Olá, {getFirstName(user?.email)}!
            </Text>
            <Text style={styles.subtitle}>Como estão suas finanças hoje?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getFirstName(user?.email).charAt(0)}
            </Text>
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
                {formatCurrency(balanceTotal)}
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
                {formatCurrency(incomeTotal)}
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
                {formatCurrency(expenseTotal)}
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
                <TouchableOpacity
                  onPress={() => navigation.navigate("Transactions")}
                >
                  <Text
                    style={[styles.seeAllText, { color: theme.colors.primary }]}
                  >
                    Ver todas
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.transactionsList}>
                {transactions.length === 0 ? (
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Nenhuma transação ainda
                  </Text>
                ) : (
                  transactions.map((t, idx) => (
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
            onClose={() => setModalVisible(false)}
            onSave={handleSaveTransaction}
            type={modalType}
          />
        </ScrollView>
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
