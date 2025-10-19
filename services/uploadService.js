import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image to Firebase Storage
 * @param {string} uri - Local file URI
 * @returns {Promise<string>} - Download URL
 */
export async function uploadImageAsync(folder, uri) {
  try {
    // For React Native/Expo, we need to handle the blob differently
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `${folder}/${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}.jpg`;
    const fileRef = ref(getStorage(), filename);

    // Upload the blob directly to Firebase Storage
    // Firebase Storage can handle blob objects directly in React Native
    const result = await uploadBytes(fileRef, blob, {
      contentType: "image/jpeg",
    });

    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("Erro no uploadImageAsync:", error);
    throw error;
  }
}

// Keep backward compatibility with the old function name
export async function uploadFileToStorage(uri, folder = "uploads") {
  if (!uri) {
    console.log("[uploadFileToStorage] uri vazio ou indefinido:", uri);
    return null;
  }
  // If already a remote URL, return as is
  if (uri.startsWith("http")) {
    console.log("[uploadFileToStorage] uri já é uma URL remota:", uri);
    return uri;
  }

  try {
    return await uploadImageAsync(folder, uri);
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    // Exibe o payload completo do erro, se existir
    if (error && typeof error === "object") {
      for (const key in error) {
        if (Object.prototype.hasOwnProperty.call(error, key)) {
          console.log(`Erro propriedade [${key}]:`, error[key]);
        }
      }
      if (error.serverResponse) {
        console.log("Resposta do servidor:", error.serverResponse);
      }
    }
  }
}
