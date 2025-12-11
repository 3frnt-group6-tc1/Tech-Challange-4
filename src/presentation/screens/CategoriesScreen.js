import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../domain/contexts/ThemeContext";
import { useTransactions } from "../../domain/contexts/TransactionsContext";
import { Card } from "../components";
import { ScreenHeader } from "../components/molecules/ScreenHeader";
import { SectionHeader } from "../components/molecules/SectionHeader";
import CategoryModal from "../components/legacy/CategoryModal";
import CategoryItem from "../components/legacy/CategoryItem";
import { useCategoryModal } from "../hooks/useCategoryModal";

const CategoriesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { categories } = useTransactions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Use the category modal hook to get the delete handler
  const { handleDelete } = useCategoryModal({
    editingCategory: null,
    visible: false,
    onClose: () => {},
  });

  const handleAddCategory = (type) => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleEditCategory = (type, name) => {
    setEditingCategory({ type, name });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title="Categorias"
        subtitle="Gerencie suas categorias"
        showBackButton={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.sectionCard}>
          <SectionHeader
            title="Categorias de Receitas"
            icon="📈"
            onAdd={() => handleAddCategory("income")}
            addButtonColor={theme.colors.success}
            theme={theme}
          />

          {categories.income.map((category, index) => (
            <CategoryItem
              key={`income-${index}`}
              category={category}
              type="income"
              onEdit={handleEditCategory}
              onDelete={handleDelete}
            />
          ))}
        </Card>

        <Card style={styles.sectionCard}>
          <SectionHeader
            title="Categorias de Despesas"
            icon="📉"
            onAdd={() => handleAddCategory("expense")}
            addButtonColor={theme.colors.error}
            theme={theme}
          />
          {categories.expense.map((category, index) => (
            <CategoryItem
              key={`expense-${index}`}
              category={category}
              type="expense"
              onEdit={handleEditCategory}
              onDelete={handleDelete}
            />
            </TouchableOpacity>
          </View>

          {categories.expense.map((category, index) => (
            <CategoryItem
              key={`expense-${index}`}
              category={category}
              type="expense"
              onEdit={handleEditCategory}
              onDelete={handleDelete}
            />
          ))}
        </Card>
      </ScrollView>

      <CategoryModal
        visible={modalVisible}
        onClose={handleCloseModal}
        editingCategory={editingCategory}
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
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
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
});

export default CategoriesScreen;
