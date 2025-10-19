import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import RecurringTransactionModal from '../components/RecurringTransactionModal';
import { formatDate } from '../utils/dateFormatter';

const RecurringTransactionsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setModalVisible(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  };

  const handleSaveTransaction = (transactionData) => {
    if (transactionData._delete) {
      deleteRecurringTransaction(editingTransaction.id);
      Alert.alert('Sucesso', 'Transação recorrente excluída!');
    } else if (editingTransaction) {
      updateRecurringTransaction({ ...editingTransaction, ...transactionData });
      Alert.alert('Sucesso', 'Transação recorrente atualizada!');
    } else {
      // Adicionar nova transação recorrente
      addRecurringTransaction(transactionData);
      Alert.alert('Sucesso', 'Transação recorrente adicionada!');
    }
    setModalVisible(false);
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return labels[frequency] || frequency;
  };

  const getFrequencyIcon = (frequency) => {
    const icons = {
      daily: '🔄',
      weekly: '📅',
      monthly: '📆',
      yearly: '🗓️'
    };
    return icons[frequency] || '📅';
  };

  const RecurringTransactionItem = ({ transaction }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
            {transaction.title}
          </Text>
          <Text style={[styles.transactionDescription, { color: theme.colors.textSecondary }]}>
            {transaction.description}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText, 
            { color: transaction.type === 'income' ? theme.colors.success : theme.colors.error }
          ]}>
            R$ {transaction.amount.toFixed(2)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Categoria:
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {transaction.category}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Frequência:
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {getFrequencyIcon(transaction.frequency)} {getFrequencyLabel(transaction.frequency)}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Próxima data:
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {formatDate(transaction.nextDueDate)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleEditTransaction(transaction)}
        >
          <Text style={styles.actionButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => {
            Alert.alert(
              'Confirmar Exclusão',
              'Tem certeza que deseja excluir esta transação recorrente?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Excluir',
                  style: 'destructive',
                  onPress: () => deleteRecurringTransaction(transaction.id)
                }
              ]
            );
          }}
        >
          <Text style={styles.actionButtonText}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Transações Recorrentes</Text>
            <Text style={styles.headerSubtitle}>Gerencie suas transações automáticas</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {recurringTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              📅 Nenhuma transação recorrente
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Adicione transações que se repetem automaticamente para facilitar o controle financeiro.
            </Text>
            <Button
              title="Adicionar Primeira Transação"
              onPress={handleAddTransaction}
              style={styles.addFirstButton}
            />
          </Card>
        ) : (
          <>
            <View style={styles.headerActions}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Suas Transações Recorrentes ({recurringTransactions.length})
              </Text>
              <Button
                title="+ Adicionar"
                onPress={handleAddTransaction}
                style={styles.addButton}
              />
            </View>
            
            {recurringTransactions.map((transaction) => (
              <RecurringTransactionItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </>
        )}
      </ScrollView>

      <RecurringTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  addFirstButton: {
    paddingHorizontal: 24,
  },
  transactionCard: {
    marginBottom: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RecurringTransactionsScreen;
