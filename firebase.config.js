import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// gs://techchallenge3-1d9d7.firebasestorage.app
const firebaseConfig = {
  apiKey: "AIzaSyAmnAgtZYPTyHI27qB7O_DoZ9XWy4tvvwU",
  authDomain: "techchallenge3-1d9d7.firebaseapp.com",
  projectId: "techchallenge3-1d9d7",
  storageBucket: "techchallenge3-1d9d7.firebasestorage.app",
  messagingSenderId: "436810716039",
  appId: "1:436810716039:web:e2bc207f7c01b51479f922",
};

const app = initializeApp(firebaseConfig);

// Configurar auth baseado na plataforma
let auth;
if (Platform.OS === "web") {
  // Na web, usar getAuth padrão (usa IndexedDB por padrão)
  auth = getAuth(app);
} else {
  // Em mobile (iOS/Android), usar AsyncStorage para persistência
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

const storage = getStorage(app);
const db = getFirestore(app);

export { auth, storage, db };
export default app;
