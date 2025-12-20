/**
 * @fileoverview Componente de card/container reutilizável
 * @module presentation/components/atoms/Card
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

/**
 * Componente de card para agrupar conteúdo com estilização consistente
 * 
 * @component
 * @description
 * Card atômico seguindo Atomic Design. Fornece:
 * - Background e sombra consistentes com o tema
 * - Padding e margin configuráveis
 * - Bordas arredondadas
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Conteúdo do card
 * @param {Object} [props.style] - Estilos adicionais
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.padding='md'] - Padding interno
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.margin='sm'] - Margem externa
 * @param {string} [props.testID='card'] - ID para testes automatizados
 * 
 * @example
 * // Card básico
 * <Card>
 *   <Text>Conteúdo do card</Text>
 * </Card>
 * 
 * @example
 * // Card com padding grande e sem margem
 * <Card padding="lg" margin="xs">
 *   <TransactionList />
 * </Card>
 * 
 * @returns {React.ReactElement} Componente Card renderizado
 */
export const Card = React.memo(
  ({ children, style, padding = "md", margin = "sm", testID, ...otherProps }) => {
    const { theme } = useTheme();

    const getCardStyle = () => {
      const baseStyle = {
        backgroundColor: theme.colors.card,
        padding: theme.spacing[padding],
        margin: theme.spacing[margin],
        borderRadius: theme.borderRadius.md,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      };

      return [baseStyle, ...(Array.isArray(style) ? style : [style])].filter(
        Boolean
      );
    };

    return (
      <View style={getCardStyle()} testID={testID || "card"} {...otherProps}>
        {children}
      </View>
    );
  }
);

Card.displayName = "Card";
