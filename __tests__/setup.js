import "@testing-library/jest-native/extend-expect";

// Suppress react-test-renderer deprecation warnings
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].includes("react-test-renderer is deprecated")) {
    return;
  }
  originalError(...args);
};

// Enhanced React Native mock
jest.mock("react-native", () => {
  const React = require("react");
  return {
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => {
        if (Array.isArray(style)) {
          return Object.assign({}, ...style);
        }
        return style || {};
      }),
    },
    View: React.forwardRef((props, ref) =>
      React.createElement("View", { ...props, ref })
    ),
    Text: React.forwardRef((props, ref) =>
      React.createElement("Text", { ...props, ref })
    ),
    TextInput: React.forwardRef((props, ref) =>
      React.createElement("TextInput", { ...props, ref })
    ),
    TouchableOpacity: React.forwardRef(
      ({ onPress, disabled, ...props }, ref) => {
        const handlePress = (e) => {
          if (!disabled && onPress) {
            onPress(e);
          }
        };
        return React.createElement("TouchableOpacity", {
          ...props,
          onPress: handlePress,
          disabled,
          ref,
        });
      }
    ),
    Modal: ({ visible, children, ...props }) =>
      visible ? React.createElement("Modal", props, children) : null,
    ScrollView: React.forwardRef((props, ref) =>
      React.createElement("ScrollView", { ...props, ref })
    ),
    Image: React.forwardRef((props, ref) =>
      React.createElement("Image", { ...props, ref })
    ),
    ActivityIndicator: React.forwardRef((props, ref) =>
      React.createElement("ActivityIndicator", { ...props, ref })
    ),
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: "ios",
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
    },
    Animated: {
      View: React.forwardRef((props, ref) =>
        React.createElement("View", { ...props, ref })
      ),
      Text: React.forwardRef((props, ref) =>
        React.createElement("Text", { ...props, ref })
      ),
      Value: jest.fn(() => ({
        interpolate: jest.fn(() => 0),
        setValue: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
      })),
      parallel: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
        stop: jest.fn(),
      })),
    },
  };
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Expo Image
jest.mock("expo-image", () => {
  const React = require("react");
  return {
    Image: React.forwardRef((props, ref) =>
      React.createElement("Image", { ...props, ref })
    ),
  };
});

// Mock Firebase
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));

jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  return {
    Ionicons: (props) => React.createElement("Ionicons", props),
    MaterialIcons: (props) => React.createElement("MaterialIcons", props),
    FontAwesome: (props) => React.createElement("FontAwesome", props),
    Feather: (props) => React.createElement("Feather", props),
    AntDesign: (props) => React.createElement("AntDesign", props),
  };
});

// Mock expo-crypto
jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn(() => Promise.resolve(new Uint8Array(32))),
  digestStringAsync: jest.fn(() => Promise.resolve("mocked-hash")),
  CryptoDigestAlgorithm: {
    SHA256: "SHA-256",
    SHA512: "SHA-512",
  },
}));

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  WHEN_UNLOCKED: "WHEN_UNLOCKED",
}));

// Mock EncryptionService
jest.mock("../src/infrastructure/services/EncryptionService", () => ({
  encryptionService: {
    initialize: jest.fn(() => Promise.resolve()),
    encrypt: jest.fn((data) => Promise.resolve(`encrypted_${data}`)),
    decrypt: jest.fn((data) => Promise.resolve(data.replace("encrypted_", ""))),
    encryptTransaction: jest.fn((transaction) => Promise.resolve(transaction)),
    decryptTransaction: jest.fn((transaction) => Promise.resolve(transaction)),
    decryptTransactions: jest.fn((transactions) => Promise.resolve(transactions)),
    hashPassword: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
    isInitialized: true,
  },
  default: {
    initialize: jest.fn(() => Promise.resolve()),
    encrypt: jest.fn((data) => Promise.resolve(`encrypted_${data}`)),
    decrypt: jest.fn((data) => Promise.resolve(data.replace("encrypted_", ""))),
    encryptTransaction: jest.fn((transaction) => Promise.resolve(transaction)),
    decryptTransaction: jest.fn((transaction) => Promise.resolve(transaction)),
    decryptTransactions: jest.fn((transactions) => Promise.resolve(transactions)),
    hashPassword: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
    isInitialized: true,
  },
}));

// Setup test timeout
jest.setTimeout(10000);
