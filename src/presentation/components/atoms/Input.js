/**
 * @fileoverview Componente de input/campo de texto reutilizável
 * @module presentation/components/atoms/Input
 */

import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

/**
 * Componente de input de texto com label e validação
 * 
 * @component
 * @description
 * Input atômico seguindo Atomic Design. Suporta:
 * - Label opcional
 * - Mensagem de erro com destaque visual
 * - Múltiplos tipos de teclado
 * - Modo multiline para textos longos
 * - Entrada segura para senhas
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} [props.label] - Label exibida acima do input
 * @param {string} props.value - Valor atual do input
 * @param {Function} props.onChangeText - Callback quando texto muda
 * @param {string} [props.placeholder] - Texto placeholder
 * @param {boolean} [props.secureTextEntry=false] - Ocultar texto (senhas)
 * @param {'default'|'numeric'|'email-address'|'phone-pad'} [props.keyboardType='default'] - Tipo de teclado
 * @param {'none'|'sentences'|'words'|'characters'} [props.autoCapitalize='sentences'] - Auto capitalização
 * @param {string} [props.error] - Mensagem de erro a exibir
 * @param {boolean} [props.multiline=false] - Permitir múltiplas linhas
 * @param {number} [props.numberOfLines=1] - Número de linhas (multiline)
 * @param {number} [props.maxLength] - Limite de caracteres
 * @param {Object} [props.style] - Estilos adicionais para o input
 * @param {Object} [props.containerStyle] - Estilos para o container
 * @param {string} [props.testID] - ID para testes automatizados
 * 
 * @example
 * // Input simples
 * <Input
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   keyboardType="email-address"
 * />
 * 
 * @example
 * // Input de senha com erro
 * <Input
 *   label="Senha"
 *   value={password}
 *   onChangeText={setPassword}
 *   secureTextEntry
 *   error={errors.password}
 * />
 * 
 * @example
 * // Input multiline para descrição
 * <Input
 *   label="Descrição"
 *   value={description}
 *   onChangeText={setDescription}
 *   multiline
 *   numberOfLines={4}
 *   maxLength={500}
 * />
 * 
 * @returns {React.ReactElement} Componente Input renderizado
 */
export const Input = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
    error,
    multiline = false,
    numberOfLines = 1,
    maxLength,
    style,
    containerStyle,
    testID,
    ...props
  }) => {
    const { theme } = useTheme();

    const getInputStyle = () => {
      const baseStyle = {
        backgroundColor: theme.colors.surface,
        borderColor: error ? theme.colors.error : theme.colors.border,
        color: theme.colors.text,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        borderWidth: 1,
        minHeight: multiline ? 80 : 48,
      };

      return [baseStyle, style];
    };

    const getLabelStyle = () => {
      return {
        color: theme.colors.text,
        fontSize: theme.fontSize.sm,
        fontWeight: "600",
        marginBottom: 8,
      };
    };

    /**
     * Computes error text styles based on theme
     */
    const getErrorStyle = () => {
      return {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
      };
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={getLabelStyle()}>{label}</Text>}
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          testID={testID || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`}
          {...props}
        />
        {error && <Text style={getErrorStyle()}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
