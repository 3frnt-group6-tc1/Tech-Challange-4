import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Button } from './Button';
import NativeDatePicker from './NativeDatePicker';

const RecurringTransactionModal = ({ 
  visible, 
  onClose, 
  onSave, 
  transaction = null
}) => {
  const { theme } = useTheme();
  const { categories } = useTransactions();
  const { formatCurrencyInput, parseCurrency, currency } = useCurrency();
  
  const frequencies = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' }
  ];

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      amount: '',
      category: '',
      frequency: 'monthly',
      nextDueDate: new Date().toISOString().split('T')[0],
    }
  });

  useEffect(() => {
    if (transaction) {
      reset({
        title: transaction.title || '',
        description: transaction.description || '',
        amount: transaction.amount?.toString() || '',
        category: transaction.category || '',
        frequency: transaction.frequency || 'monthly',
        nextDueDate: transaction.nextDueDate || new Date().toISOString().split('T')[0],
      });
    } else {
      reset({
        title: '',
        description: '',
        amount: '',
        category: '',
        frequency: 'monthly',
        nextDueDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [transaction, visible, reset]);

  const onSubmit = (data) => {
    const amount = parseFloat(parseCurrency(data.amount));
    const transactionData = {
      title: data.title.trim(),
      description: data.description.trim(),
      amount: amount,
      category: data.category,
      type: transaction ? transaction.type : 'expense',
      frequency: data.frequency,
      nextDueDate: data.nextDueDate,
    };

    if (transaction) {
      onSave({ ...transaction, ...transactionData });
    } else {
      onSave(transactionData);
    }
    
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta transação recorrente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            onSave({ ...transaction, _delete: true });
            onClose();
          }
        }
      ]
    );
  };

  const modalTitle = transaction ? 'Editar Transação Recorrente' : 'Nova Transação Recorrente';

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {modalTitle}
          </Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Título *</Text>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: 'Título é obrigatório',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Digite o título"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={[
                      styles.input, 
                      { 
                        borderColor: errors.title ? '#ff4444' : theme.colors.border, 
                        color: theme.colors.text 
                      }
                    ]}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                )}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Descrição *</Text>
              <Controller
                control={control}
                name="description"
                rules={{
                  required: 'Descrição é obrigatória',
                  minLength: {
                    value: 3,
                    message: 'Descrição deve ter pelo menos 3 caracteres'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Digite a descrição (mín. 3 caracteres)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.input, 
                      styles.textArea,
                      { 
                        borderColor: errors.description ? '#ff4444' : theme.colors.border, 
                        color: theme.colors.text 
                      }
                    ]}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                )}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Valor *</Text>
              <Controller
                control={control}
                name="amount"
                rules={{
                  required: 'Valor é obrigatório',
                  validate: (value) => {
                    const amount = parseFloat(parseCurrency(value));
                    if (isNaN(amount) || amount <= 0) {
                      return 'Valor deve ser um número maior que zero';
                    }
                    return true;
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={`Digite o valor (ex: ${currency.symbol} 100,50)`}
                    value={value ? formatCurrencyInput(value) : ''}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/\D/g, '');
                      onChange(numericValue);
                    }}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    style={[
                      styles.input, 
                      { 
                        borderColor: errors.amount ? '#ff4444' : theme.colors.border, 
                        color: theme.colors.text 
                      }
                    ]}
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                )}
              />
              {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Categoria *</Text>
              <Controller
                control={control}
                name="category"
                rules={{
                  required: 'Categoria é obrigatória',
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.categoryContainer}>
                    {categories.expense.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryButton,
                          {
                            backgroundColor: value === cat 
                              ? theme.colors.primary 
                              : theme.colors.background,
                            borderColor: theme.colors.border,
                          }
                        ]}
                        onPress={() => onChange(cat)}
                      >
                        <Text style={[
                          styles.categoryText,
                          {
                            color: value === cat 
                              ? '#ffffff' 
                              : theme.colors.text
                          }
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Frequência *</Text>
              <Controller
                control={control}
                name="frequency"
                rules={{
                  required: 'Frequência é obrigatória',
                }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.frequencyContainer}>
                    {frequencies.map((freq) => (
                      <TouchableOpacity
                        key={freq.value}
                        style={[
                          styles.frequencyButton,
                          {
                            backgroundColor: value === freq.value 
                              ? theme.colors.primary 
                              : theme.colors.background,
                            borderColor: theme.colors.border,
                          }
                        ]}
                        onPress={() => onChange(freq.value)}
                      >
                        <Text style={[
                          styles.frequencyText,
                          {
                            color: value === freq.value 
                              ? '#ffffff' 
                              : theme.colors.text
                          }
                        ]}>
                          {freq.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.frequency && <Text style={styles.errorText}>{errors.frequency.message}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Próxima Data *</Text>
              <Controller
                control={control}
                name="nextDueDate"
                rules={{
                  required: 'Data é obrigatória',
                }}
                render={({ field: { onChange, value } }) => (
                  <NativeDatePicker
                    value={value ? new Date(value) : null}
                    onChange={(selectedDate) => {
                      if (selectedDate) {
                        onChange(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                    mode="date"
                    placeholder="Selecionar próxima data"
                    error={!!errors.nextDueDate}
                  />
                )}
              />
              {errors.nextDueDate && <Text style={styles.errorText}>{errors.nextDueDate.message}</Text>}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            {transaction && (
              <Button
                title="Excluir"
                variant="danger"
                style={styles.deleteButton}
                onPress={handleDelete}
              />
            )}
            <Button
              title="Cancelar"
              style={styles.cancelButton}
              onPress={handleClose}
            />
            <Button
              title="Salvar"
              variant="danger"
              style={styles.saveButton}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  deleteButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default RecurringTransactionModal;

