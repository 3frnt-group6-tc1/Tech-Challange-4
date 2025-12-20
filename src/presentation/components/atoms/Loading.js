/**
 * @fileoverview Componente de indicador de carregamento
 * @module presentation/components/atoms/Loading
 */

import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

/**
 * Componente de loading/carregamento com mensagem opcional
 * 
 * @component
 * @description
 * Indicador de carregamento atômico que exibe um spinner
 * centralizado com mensagem opcional abaixo.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} [props.message='Carregando...'] - Mensagem exibida abaixo do spinner
 * @param {'small'|'large'} [props.size='large'] - Tamanho do spinner
 * @param {Object} [props.style] - Estilos adicionais para o container
 * @param {string} [props.testID='loading'] - ID para testes automatizados
 * 
 * @example
 * // Loading simples
 * <Loading />
 * 
 * @example
 * // Loading com mensagem customizada
 * <Loading message="Salvando transação..." size="small" />
 * 
 * @returns {React.ReactElement} Componente Loading renderizado
 */
export const Loading = React.memo(
  ({ message = "Carregando...", size = "large", style, testID }) => {
    const { theme } = useTheme();

    const getContainerStyle = () => {
      return [
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ];
    };

    const getTextStyle = () => {
      return {
        color: theme.colors.text,
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
      };
    };

    return (
      <View style={getContainerStyle()} testID={testID || "loading"}>
        <ActivityIndicator size={size} color={theme.colors.primary} />
        {message && <Text style={getTextStyle()}>{message}</Text>}
      </View>
    );
  }
);

Loading.displayName = "Loading";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
