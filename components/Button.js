import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  style,
  textStyle 
}) => {
  const { theme } = useTheme();
  
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyles = {
      sm: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
      md: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg },
      lg: { paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xl },
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: 'transparent',
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

  const getTextStyle = () => {
    const baseTextStyle = {
      fontSize: theme.fontSize[size],
      fontWeight: 'bold',
    };

    const variantTextStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: theme.colors.primary },
      danger: { color: '#FFFFFF' },
      success: { color: '#FFFFFF' },
    };

    return [
      baseTextStyle,
      variantTextStyles[variant],
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'secondary' ? theme.colors.primary : '#FFFFFF'} 
          style={{ marginRight: theme.spacing.sm }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};
