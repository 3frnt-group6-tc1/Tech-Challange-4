/**
 * @fileoverview Componente de botão reutilizável
 * @module presentation/components/atoms/Button
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

/**
 * Componente de botão configurável com suporte a variantes, tamanhos e estados
 * 
 * @component
 * @description
 * Botão atômico seguindo Atomic Design. Suporta:
 * - Variantes visuais (primary, secondary, danger, success)
 * - Tamanhos (sm, md, lg)
 * - Estado de loading com spinner
 * - Estado desabilitado
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Texto do botão (obrigatório)
 * @param {Function} props.onPress - Callback ao pressionar
 * @param {'primary'|'secondary'|'danger'|'success'} [props.variant='primary'] - Estilo visual
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Tamanho do botão
 * @param {boolean} [props.disabled=false] - Se o botão está desabilitado
 * @param {boolean} [props.loading=false] - Se deve mostrar spinner de loading
 * @param {Object} [props.style] - Estilos adicionais para o container
 * @param {Object} [props.textStyle] - Estilos adicionais para o texto
 * @param {string} [props.testID] - ID para testes automatizados
 * 
 * @example
 * // Botão primário padrão
 * <Button title="Salvar" onPress={handleSave} />
 * 
 * @example
 * // Botão de perigo com loading
 * <Button 
 *   title="Excluir" 
 *   variant="danger" 
 *   loading={isDeleting}
 *   onPress={handleDelete} 
 * />
 * 
 * @example
 * // Botão secundário pequeno
 * <Button title="Cancelar" variant="secondary" size="sm" onPress={handleCancel} />
 * 
 * @returns {React.ReactElement} Componente Button renderizado
 */
export const Button = React.memo(
  ({
    title,
    onPress,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    style,
    textStyle,
    testID,
  }) => {
    const { theme } = useTheme();

    const getButtonStyle = () => {
      const baseStyle = {
        borderRadius: theme.borderRadius.sm,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
      };

      const sizeStyles = {
        sm: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        },
        md: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        },
        lg: {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
        },
      };

      const variantStyles = {
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.primary,
        },
        danger: {
          backgroundColor: theme.colors.error,
        },
        success: {
          backgroundColor: theme.colors.success,
        },
      };

      return [
        baseStyle,
        sizeStyles[size],
        variantStyles[variant],
        disabled && { opacity: 0.6 },
        style,
      ];
    };

    /**
     * Computes text styles based on variant and size
     * Following Single Responsibility Principle
     */
    const getTextStyle = () => {
      const baseTextStyle = {
        fontSize: theme.fontSize[size],
        fontWeight: "bold",
      };

      const variantTextStyles = {
        primary: { color: "#FFFFFF" },
        secondary: { color: theme.colors.primary },
        danger: { color: "#FFFFFF" },
        success: { color: "#FFFFFF" },
      };

      return [baseTextStyle, variantTextStyles[variant], textStyle];
    };

    /**
     * Gets loading indicator color based on variant
     */
    const getLoadingColor = () => {
      return variant === "secondary" ? theme.colors.primary : "#FFFFFF";
    };

    return (
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        testID={testID || `button-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={getLoadingColor()}
            style={{ marginRight: theme.spacing.sm }}
          />
        )}
        <Text style={getTextStyle()}>{title}</Text>
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";
