import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../contexts/ThemeContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import NativeDatePicker from '../components/NativeDatePicker';
import { generateCSVReport, generateTextReport } from '../utils/reportGenerator';

const ExportReportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { transactions } = useTransactions();
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsGenerating(true);
      
      if (transactions.length === 0) {
        Alert.alert('Aviso', 'Não há transações para exportar. Adicione algumas transações primeiro.');
        return;
      }
      
      const csvContent = generateCSVReport(transactions, dateRange);
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const periodStr = dateRange.start && dateRange.end 
        ? `_${dateRange.start}_a_${dateRange.end}` 
        : '_todos_periodos';
      const fileName = `relatorio_financeiro${periodStr}_${dateStr}.csv`;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('Sucesso', `Arquivo CSV "${fileName}" baixado com sucesso!`);
      } else {
        const fileUri = FileSystem.documentDirectory + fileName;
        
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: 'utf8',
        });
        
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: `Relatório Financeiro - ${fileName}`,
          });
          Alert.alert('Sucesso', `Relatório CSV "${fileName}" compartilhado com sucesso!`);
        } else {
          await Share.share({
            message: csvContent,
            title: `Relatório Financeiro - ${fileName}`,
          });
          Alert.alert('Sucesso', `Relatório CSV "${fileName}" compartilhado com sucesso!`);
        }
      }
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      Alert.alert('Erro', 'Erro ao gerar relatório CSV: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportText = async () => {
    try {
      setIsGenerating(true);
      
      if (transactions.length === 0) {
        Alert.alert('Aviso', 'Não há transações para exportar. Adicione algumas transações primeiro.');
        return;
      }
      
      const textContent = generateTextReport(transactions, dateRange);
      
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const periodStr = dateRange.start && dateRange.end 
        ? `_${dateRange.start}_a_${dateRange.end}` 
        : '_todos_periodos';
      const fileName = `relatorio_financeiro${periodStr}_${dateStr}.txt`;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('Sucesso', `Arquivo de texto "${fileName}" baixado com sucesso!`);
      } else {
        const fileUri = FileSystem.documentDirectory + fileName;
        
        await FileSystem.writeAsStringAsync(fileUri, textContent, {
          encoding: 'utf8',
        });
        
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/plain',
            dialogTitle: `Relatório Financeiro - ${fileName}`,
          });
          Alert.alert('Sucesso', `Relatório de texto "${fileName}" compartilhado com sucesso!`);
        } else {
          await Share.share({
            message: textContent,
            title: `Relatório Financeiro - ${fileName}`,
          });
          Alert.alert('Sucesso', `Relatório de texto "${fileName}" compartilhado com sucesso!`);
        }
      }
      
    } catch (error) {
      console.error('Erro ao exportar texto:', error);
      Alert.alert('Erro', 'Erro ao gerar relatório de texto: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };


  const clearDateRange = () => {
    setDateRange({ start: null, end: null });
  };

  const setAllTime = () => {
    setDateRange({ start: null, end: null });
  };

  const setThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateRange({
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    });
  };

  const setLastMonth = () => {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    setDateRange({
      start: startOfLastMonth.toISOString().split('T')[0],
      end: endOfLastMonth.toISOString().split('T')[0]
    });
  };

  const getDateRangeLabel = () => {
    if (!dateRange.start || !dateRange.end) {
      return 'Todos os períodos';
    }
    return `${dateRange.start} a ${dateRange.end}`;
  };

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
            <Text style={styles.headerTitle}>Exportar Relatórios</Text>
            <Text style={styles.headerSubtitle}>Gere relatórios dos seus dados financeiros</Text>
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
            📅 Período do Relatório
          </Text>
          
          <View style={styles.transactionCount}>
            <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>
              📊 Total de transações disponíveis: {transactions.length}
            </Text>
          </View>
          
          <View style={styles.quickFilters}>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
              onPress={setAllTime}
            >
              <Text style={styles.filterButtonText}>Todos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={setThisMonth}
            >
              <Text style={[styles.filterButtonText, { color: theme.colors.text }]}>Este Mês</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={setLastMonth}
            >
              <Text style={[styles.filterButtonText, { color: theme.colors.text }]}>Mês Passado</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInput}>
              <Text style={[styles.dateLabel, { color: theme.colors.text }]}>Data Inicial</Text>
              <NativeDatePicker
                value={dateRange.start ? new Date(dateRange.start) : null}
                onChange={(date) => {
                  if (date) {
                    setDateRange(prev => ({
                      ...prev,
                      start: date.toISOString().split('T')[0]
                    }));
                  }
                }}
                mode="date"
                placeholder="Selecionar data inicial"
              />
            </View>
            
            <View style={styles.dateInput}>
              <Text style={[styles.dateLabel, { color: theme.colors.text }]}>Data Final</Text>
              <NativeDatePicker
                value={dateRange.end ? new Date(dateRange.end) : null}
                onChange={(date) => {
                  if (date) {
                    setDateRange(prev => ({
                      ...prev,
                      end: date.toISOString().split('T')[0]
                    }));
                  }
                }}
                mode="date"
                placeholder="Selecionar data final"
              />
            </View>
          </View>

          <View style={styles.dateRangeInfo}>
            <Text style={[styles.dateRangeText, { color: theme.colors.textSecondary }]}>
              Período selecionado: {getDateRangeLabel()}
            </Text>
            {(dateRange.start || dateRange.end) && (
              <TouchableOpacity onPress={clearDateRange}>
                <Text style={[styles.clearButton, { color: theme.colors.primary }]}>
                  Limpar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📊 Formatos de Exportação
          </Text>
          
          <View style={styles.exportOptions}>
            <View style={styles.exportOption}>
              <View style={styles.exportInfo}>
                <Text style={[styles.exportTitle, { color: theme.colors.text }]}>
                  📄 CSV (Planilha)
                </Text>
                <Text style={[styles.exportDescription, { color: theme.colors.textSecondary }]}>
                  Arquivo CSV para Excel, Google Sheets e análise de dados
                </Text>
              </View>
              <Button
                title="Exportar"
                onPress={handleExportCSV}
                loading={isGenerating}
                style={styles.exportButton}
              />
            </View>

            <View style={styles.exportOption}>
              <View style={styles.exportInfo}>
                <Text style={[styles.exportTitle, { color: theme.colors.text }]}>
                  📝 Texto
                </Text>
                <Text style={[styles.exportDescription, { color: theme.colors.textSecondary }]}>
                  Arquivo de texto formatado para compartilhamento
                </Text>
              </View>
              <Button
                title="Exportar"
                onPress={handleExportText}
                loading={isGenerating}
                style={styles.exportButton}
              />
            </View>

          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            ℹ️ Informações
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            • Os relatórios incluem todas as transações do período selecionado{'\n'}
            • CSV: arquivo baixado/compartilhado para Excel, Google Sheets{'\n'}
            • Texto: arquivo baixado/compartilhado para mensagens{'\n'}
            • Nomes dos arquivos incluem data e período selecionado{'\n'}
            • Total de transações: {transactions.length}
          </Text>
        </Card>
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
  transactionCount: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickFilters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dateRangeContainer: {
    gap: 16,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateRangeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  dateRangeText: {
    fontSize: 14,
    flex: 1,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  exportOptions: {
    gap: 16,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  exportInfo: {
    flex: 1,
    marginRight: 16,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
});

export default ExportReportScreen;
