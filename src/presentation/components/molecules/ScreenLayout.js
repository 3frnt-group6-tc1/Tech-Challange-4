import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../domain/contexts/ThemeContext";
import { ScreenHeader } from "./ScreenHeader";

/**
 * Reusable screen layout wrapper
 * Reduces duplication across screens with similar structure
 */
export const ScreenLayout = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  headerChildren,
  children,
  scrollable = true,
}) => {
  const { theme } = useTheme();

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        onBack={onBack}
      >
        {headerChildren}
      </ScreenHeader>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
