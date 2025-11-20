import { Modal, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";

const ImagePreviewModal = ({ visible, imageUri, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>❌</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="contain"
          transition={300}
          cachePolicy="memory-disk"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 30,
    zIndex: 2,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#fff",
  },
});

export default ImagePreviewModal;
