import { useState, useCallback } from "react";

/**
 * Custom hook for managing image preview modal state
 * Handles opening, closing, and tracking the current preview image
 */
export const useImagePreview = () => {
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUri, setImagePreviewUri] = useState(null);

  /**
   * Open image preview modal with the given URI
   * @param {string} uri - The image URI to preview
   */
  const openImagePreview = useCallback((uri) => {
    setImagePreviewUri(uri);
    setImagePreviewVisible(true);
  }, []);

  /**
   * Close image preview modal and clear the URI
   */
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
