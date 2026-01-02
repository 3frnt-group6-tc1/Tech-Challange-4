module.exports = {
  getRandomBytesAsync: jest.fn(() => Promise.resolve(new Uint8Array(32))),
  digestStringAsync: jest.fn(() => Promise.resolve("mocked-hash-value")),
  CryptoDigestAlgorithm: {
    SHA256: "SHA-256",
    SHA512: "SHA-512",
    SHA1: "SHA-1",
    MD5: "MD5",
  },
  CryptoEncoding: {
    HEX: "hex",
    BASE64: "base64",
  },
};

