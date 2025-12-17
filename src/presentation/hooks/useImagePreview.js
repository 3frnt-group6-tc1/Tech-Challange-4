import { useState, useCallback } from "react";

export const useImagePreview = () => {
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUri, setImagePreviewUri] = useState(null);

  const openImagePreview = useCallback((uri) => {
    setImagePreviewUri(uri);
    setImagePreviewVisible(true);
  }, []);

  const closeImagePreview = useCallback(() => {
    setImagePreviewVisible(false);
    setImagePreviewUri(null);
  }, []);

  return {
    imagePreviewVisible,
    imagePreviewUri,
    openImagePreview,
    closeImagePreview,
  };
};
