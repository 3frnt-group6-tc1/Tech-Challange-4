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
  };
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

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

// Setup test timeout
jest.setTimeout(10000);
