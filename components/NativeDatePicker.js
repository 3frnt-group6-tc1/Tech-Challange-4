import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const NativeDatePicker = ({ 
  value, 
  onChange, 
  mode = 'datetime', 
  placeholder = 'Selecionar data',
  error = false 
}) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const formatDate = (date) => {
    if (!date) return placeholder;
    
    try {
      if (mode === 'datetime') {
        return date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (mode === 'time') {
        return date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
    } catch (error) {
      return placeholder;
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowModal(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setShowModal(false);
  };

  const handlePress = () => {
    setTempDate(value || new Date());
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            borderColor: error ? '#ff4444' : theme.colors.border,
            backgroundColor: theme.colors.surface,
          }
        ]}
        onPress={handlePress}
      >
        <Text style={[
          styles.pickerText,
          { 
            color: value ? theme.colors.text : theme.colors.textSecondary 
          }
        ]}>
          {formatDate(value)}
        </Text>
        <Text style={[styles.pickerIcon, { color: theme.colors.primary }]}>
          📅
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Selecionar {mode === 'datetime' ? 'Data e Horário' : mode === 'time' ? 'Horário' : 'Data'}
            </Text>
            
            <View style={styles.dateInputs}>
              <View style={styles.dateRow}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Dia:</Text>
                <TouchableOpacity
                  style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => setTempDate(new Date(tempDate.getTime() - 24 * 60 * 60 * 1000))}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {String(tempDate.getDate()).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => setTempDate(new Date(tempDate.getTime() + 24 * 60 * 60 * 1000))}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateRow}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Mês:</Text>
                <TouchableOpacity
                  style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth() - 1, tempDate.getDate()))}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {String(tempDate.getMonth() + 1).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, tempDate.getDate()))}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateRow}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Ano:</Text>
                <TouchableOpacity
                  style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => setTempDate(new Date(tempDate.getFullYear() - 1, tempDate.getMonth(), tempDate.getDate()))}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {tempDate.getFullYear()}
                </Text>
                <TouchableOpacity
                  style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                  onPress={() => setTempDate(new Date(tempDate.getFullYear() + 1, tempDate.getMonth(), tempDate.getDate()))}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>

              {(mode === 'datetime' || mode === 'time') && (
                <>
                  <View style={styles.dateRow}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Hora:</Text>
                    <TouchableOpacity
                      style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                      onPress={() => setTempDate(new Date(tempDate.getTime() - 60 * 60 * 1000))}
                    >
                      <Text style={[styles.buttonText, { color: theme.colors.text }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                      {String(tempDate.getHours()).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                      onPress={() => setTempDate(new Date(tempDate.getTime() + 60 * 60 * 1000))}
                    >
                      <Text style={[styles.buttonText, { color: theme.colors.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateRow}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Minuto:</Text>
                    <TouchableOpacity
                      style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                      onPress={() => setTempDate(new Date(tempDate.getTime() - 60 * 1000))}
                    >
                      <Text style={[styles.buttonText, { color: theme.colors.text }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                      {String(tempDate.getMinutes()).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                      onPress={() => setTempDate(new Date(tempDate.getTime() + 60 * 1000))}
                    >
                      <Text style={[styles.buttonText, { color: theme.colors.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                onPress={handleCancel}
              >
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleConfirm}
              >
                <Text style={styles.actionButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  pickerIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateInputs: {
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    width: 60,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NativeDatePicker;
