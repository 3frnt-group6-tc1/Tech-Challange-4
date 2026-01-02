import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { PieChart, BarChart } from "react-native-chart-kit";
import { useTheme } from "../../domain/contexts/ThemeContext";
import { useTransactions } from "../../domain/contexts/TransactionsContext";
import { useCurrency } from "../../domain/contexts/CurrencyContext";
import { Card } from "../components";
import { useAutoRefresh } from "../hooks/useAppState";

const DashboardScreen = React.memo(() => {
  const { theme } = useTheme();
  const { transactions, getTotalByType, getBalance } = useTransactions();
  const { formatCurrency, currency } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Auto-refresh quando app volta do background (após 30 segundos)
  const { isRefreshing: isAutoRefreshing, lastRefreshTime } = useAutoRefresh(
    onRefresh,
    {
      enabled: true,
      minBackgroundTime: 30000, // 30 segundos
      refreshOnMount: false,
    }
  );

  // Log para debug - remover em produção
  useEffect(() => {
    if (lastRefreshTime) {
      console.log("Dashboard atualizado automaticamente em:", lastRefreshTime.toLocaleTimeString());
    }
  }, [lastRefreshTime]);

  // Memoize financial totals
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

  // Memoize transaction counts
  const transactionCounts = useMemo(() => {
    const totalCount = transactions.length;
    const incomeCount = transactions.filter((t) => t.type === "income").length;
    const expenseCount = transactions.filter(
      (t) => t.type === "expense"
    ).length;

    return {
      total: totalCount,
      income: incomeCount,
      expense: expenseCount,
    };
  }, [transactions]);

  // Memoize expensive chart calculations
  const chartData = useMemo(() => {
    const incomeData = financialData.incomeTotal;
    const expenseData = financialData.expenseTotal;

    // Calculate temporal data for last 7 days
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    const dailyData = last7Days.map((date) => {
      const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" });

      const dayTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === date.toDateString();
      });

      const income = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return { day: dayName, income, expense };
    });

    const days = dailyData.map((d) => d.day);
    const incomeValues = dailyData.map((d) => d.income);
    const expenseValues = dailyData.map((d) => d.expense);

    return {
      pieData: [
        {
          name: `Receitas (${currency.symbol})`,
          population: incomeData,
          color: "#4CAF50",
          legendFontColor: theme.colors.text,
          legendFontSize: 12,
        },
        {
          name: `Despesas (${currency.symbol})`,
          population: expenseData,
          color: "#F44336",
          legendFontColor: theme.colors.text,
          legendFontSize: 12,
        },
      ],
      barData: {
        labels: days.length > 0 ? days : ["Sem dados"],
        datasets: [
          {
            data: incomeValues.length > 0 ? incomeValues : [0],
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            strokeWidth: 2,
          },
          {
            data: expenseValues.length > 0 ? expenseValues : [0],
            color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      },
    };
  }, [transactions, financialData, currency.symbol, theme.colors.text]);

  // Memoize screen width
  const screenWidth = useMemo(() => Dimensions.get("window").width, []);

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
            <Text style={styles.welcomeText}>Dashboard Financeiro</Text>
            <Text style={styles.subtitle}>
              Análises e relatórios detalhados
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>📊</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || isAutoRefreshing} 
            onRefresh={onRefresh} 
          />
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
            <Text style={[styles.summaryAmount, { color: theme.colors.error }]}>
              {formatCurrency(financialData.expenseTotal)}
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(600)}>
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              📊 Receitas vs Despesas
            </Text>

            <View style={styles.pieChartContainer}>
              <PieChart
                data={chartData.pieData}
                width={screenWidth - 80}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
              />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400).duration(600)}>
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              📈 Tendência dos Últimos 7 Dias
            </Text>

            <View style={styles.barChartContainer}>
              <BarChart
                data={chartData.barData}
                width={screenWidth - 80}
                height={220}
                yAxisLabel={`${currency.symbol} `}
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  barPercentage: 0.6,
                  fillShadowGradient: "#4CAF50",
                  fillShadowGradientOpacity: 1,
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                showValuesOnTopOfBars={true}
                showBarTops={false}
                fromZero={true}
              />

              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: "#4CAF50" }]}
                  />
                  <Text
                    style={[
                      styles.legendText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Receitas
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: "#F44336" }]}
                  />
                  <Text
                    style={[
                      styles.legendText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Despesas
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(600)}>
          <Card style={styles.statsCard}>
            <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
              📈 Estatísticas
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.primary }]}
                >
                  {transactionCounts.total}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Total de Transações
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.success }]}
                >
                  {transactionCounts.income}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Receitas
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.error }]}>
                  {transactionCounts.expense}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Despesas
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
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
  chartCard: {
    marginBottom: 24,
    paddingVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  pieChartContainer: {
    alignItems: "center",
  },
  barChartContainer: {
    alignItems: "center",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsCard: {
    marginBottom: 24,
    paddingVertical: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default DashboardScreen;
