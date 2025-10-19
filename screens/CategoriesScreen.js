import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const CategoriesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { categories, addCategory, removeCategory, updateCategory } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('income');

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryType('income');
    setModalVisible(true);
  };

  const handleEditCategory = (type, name) => {
    setEditingCategory({ type, name });
    setCategoryName(name);
    setCategoryType(type);
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Erro', 'Nome da categoria é obrigatório');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(categoryType, editingCategory.name, categoryName.trim());
        Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
      } else {
        await addCategory(categoryType, categoryName.trim());
        Alert.alert('Sucesso', 'Categoria adicionada com sucesso!');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleDeleteCategory = (type, name) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a categoria "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCategory(type, name);
              Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  };

  const CategoryItem = ({ category, type, onEdit, onDelete }) => (
    <View style={[styles.categoryItem, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
        {category}
      </Text>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onEdit(type, category)}
        >
          <Text style={styles.actionButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => onDelete(type, category)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
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
            <Text style={styles.headerTitle}>Categorias</Text>
            <Text style={styles.headerSubtitle}>Gerencie suas categorias</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📈 Categorias de Receitas
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.success }]}
              onPress={() => {
                setCategoryType('income');
                handleAddCategory();
              }}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {categories.income.map((category, index) => (
            <CategoryItem
              key={`income-${index}`}
              category={category}
              type="income"
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📉 Categorias de Despesas
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.error }]}
              onPress={() => {
                setCategoryType('expense');
                handleAddCategory();
              }}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {categories.expense.map((category, index) => (
            <CategoryItem
              key={`expense-${index}`}
              category={category}
              type="expense"
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ))}
        </Card>
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: categoryType === 'income' 
                      ? theme.colors.success 
                      : theme.colors.background,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => setCategoryType('income')}
              >
                <Text style={[
                  styles.typeButtonText,
                  { color: categoryType === 'income' ? '#fff' : theme.colors.text }
                ]}>
                  Receita
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: categoryType === 'expense' 
                      ? theme.colors.error 
                      : theme.colors.background,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => setCategoryType('expense')}
              >
                <Text style={[
                  styles.typeButtonText,
                  { color: categoryType === 'expense' ? '#fff' : theme.colors.text }
                ]}>
                  Despesa
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Nome da Categoria"
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Digite o nome da categoria"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              />
              <Button
                title={editingCategory ? 'Atualizar' : 'Adicionar'}
                variant={categoryType === 'income' ? 'success' : 'danger'}
                style={styles.saveButton}
                onPress={handleSaveCategory}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  sectionCard: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default CategoriesScreen;

