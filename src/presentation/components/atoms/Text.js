/**
 * @fileoverview Componente de texto temático
 * @module presentation/components/atoms/Text
 */

import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

/**
 * Componente de texto com suporte a tema e variantes tipográficas
 * 
 * @component
 * @description
 * Texto atômico seguindo Atomic Design com suporte a:
 * - Variantes tipográficas (h1, h2, h3, body, caption, label)
 * - Cores do tema
 * - Pesos de fonte
 * - Alinhamentos
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Conteúdo textual
 * @param {'h1'|'h2'|'h3'|'body'|'caption'|'label'} [props.variant='body'] - Variante tipográfica
 * @param {string} [props.color='text'] - Cor do texto (chave do tema ou cor direta)
 * @param {'normal'|'medium'|'semibold'|'bold'} [props.weight='normal'] - Peso da fonte
 * @param {'left'|'center'|'right'} [props.align='left'] - Alinhamento do texto
 * @param {Object} [props.style] - Estilos adicionais
 * @param {string} [props.testID] - ID para testes automatizados
 * 
 * @example
 * // Título principal
 * <ThemedText variant="h1">Dashboard</ThemedText>
 * 
 * @example
 * // Texto secundário centralizado
 * <ThemedText variant="caption" color="textSecondary" align="center">
 *   Última atualização: hoje
 * </ThemedText>
 * 
 * @example
 * // Label em negrito
 * <ThemedText variant="label" weight="bold">Total:</ThemedText>
 * 
 * @returns {React.ReactElement} Componente ThemedText renderizado
 */
export const ThemedText = React.memo(
  ({
    children,
    variant = "body",
    color = "text",
    weight = "normal",
    align = "left",
    style,
    testID,
    ...props
  }) => {
    const { theme } = useTheme();

    const getVariantStyle = () => {
      const variants = {
        h1: { fontSize: theme.fontSize.xl, fontWeight: "bold" },
        h2: { fontSize: theme.fontSize.lg, fontWeight: "bold" },
        h3: { fontSize: theme.fontSize.md, fontWeight: "600" },
        body: { fontSize: theme.fontSize.md },
        caption: { fontSize: theme.fontSize.sm },
        label: { fontSize: theme.fontSize.sm, fontWeight: "600" },
      };

      return variants[variant] || variants.body;
    };

    const getWeightStyle = () => {
      const weights = {
        normal: "normal",
        medium: "500",
        semibold: "600",
        bold: "bold",
      };

      return { fontWeight: weights[weight] };
    };

    /**
     * Computes text styles based on props and theme
     */
    const getTextStyle = () => {
      return [
        getVariantStyle(),
        getWeightStyle(),
        { color: theme.colors[color] || color },
        { textAlign: align },
        style,
      ];
    };

    return (
      <RNText style={getTextStyle()} testID={testID} {...props}>
        {children}
      </RNText>
    );
  }
);

ThemedText.displayName = "ThemedText";
