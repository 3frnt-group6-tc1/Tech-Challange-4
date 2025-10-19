import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const CurrencySettingsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { currency, currencies, updateCurrency, loading } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const handleSave = async () => {
    try {
      await updateCurrency(selectedCurrency);
      Alert.alert('Sucesso', 'Moeda padrão atualizada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar configurações de moeda');
    }
  };

  const CurrencyItem = ({ currencyItem, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        {
          backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        }
      ]}
      onPress={() => onSelect(currencyItem)}
    >
      <View style={styles.currencyInfo}>
        <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>
          {currencyItem.symbol}
        </Text>
        <View style={styles.currencyDetails}>
          <Text style={[styles.currencyName, { color: theme.colors.text }]}>
            {currencyItem.name}
          </Text>
          <Text style={[styles.currencyCode, { color: theme.colors.textSecondary }]}>
            {currencyItem.code}
          </Text>
        </View>
      </View>
      {isSelected && (
        <View style={[styles.checkIcon, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Carregando...
        </Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Moeda Padrão</Text>
            <Text style={styles.headerSubtitle}>Escolha sua moeda preferida</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            💰 Moedas Disponíveis
          </Text>
          
          <View style={styles.currencyList}>
            {currencies.map((currencyItem) => (
              <CurrencyItem
                key={currencyItem.code}
                currencyItem={currencyItem}
                isSelected={selectedCurrency.code === currencyItem.code}
                onSelect={setSelectedCurrency}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            ℹ️ Informações
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            • A moeda selecionada será usada em todos os valores do aplicativo{'\n'}
            • Os valores existentes não serão convertidos automaticamente{'\n'}
            • Você pode alterar a moeda a qualquer momento{'\n'}
            • Moeda atual: {currency.symbol} {currency.name}
          </Text>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Salvar Configurações"
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currencyList: {
    gap: 12,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 16,
    minWidth: 40,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default CurrencySettingsScreen;
