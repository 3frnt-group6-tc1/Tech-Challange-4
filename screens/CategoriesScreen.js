import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useTransactions } from "../contexts/TransactionsContext";
import { Card } from "../components/Card";
import CategoryModal from "../components/CategoryModal";
import CategoryItem from "../components/CategoryItem";
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
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.success },
              ]}
              onPress={() => handleAddCategory("income")}
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
              onDelete={handleDelete}
            />
          ))}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              📉 Categorias de Despesas
            </Text>
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={() => handleAddCategory("expense")}
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CategoriesScreen;
