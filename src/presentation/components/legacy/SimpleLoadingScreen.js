import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Componente de loading simples SEM dependências de contexto
 * Usado em Suspense fallbacks onde os contextos ainda não estão disponíveis
 */
const SimpleLoadingScreen = ({ message = 'Carregando...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});

export default SimpleLoadingScreen;

