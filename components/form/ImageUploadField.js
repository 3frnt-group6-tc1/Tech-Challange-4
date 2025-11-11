import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "../Button";

/**
 * Image upload field component for transaction forms
 * Handles image selection, preview, and removal
 */
const ImageUploadField = ({
  localImage,
  onPickImage,
  onRemoveImage,
  buttonTitle = "Selecionar imagem",
  removeText = "Remover imagem",
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Arquivo</Text>
      {localImage ? (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: localImage.uri }}
            style={styles.previewImage}
            contentFit="cover"
          />
          <TouchableOpacity onPress={onRemoveImage}>
            <Text style={[styles.removeText, { color: theme.colors.error }]}>
              {removeText}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Button
          title={buttonTitle}
          onPress={onPickImage}
          style={styles.selectButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  previewImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeText: {
    fontSize: 12,
  },
  selectButton: {
    marginBottom: 8,
  },
});

export default ImageUploadField;
