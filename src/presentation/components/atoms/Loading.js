import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";

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
