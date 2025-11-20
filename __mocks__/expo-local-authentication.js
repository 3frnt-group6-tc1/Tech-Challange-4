export const hasHardwareAsync = jest.fn(() => Promise.resolve(true));
export const isEnrolledAsync = jest.fn(() => Promise.resolve(true));
export const authenticateAsync = jest.fn(() =>
  Promise.resolve({ success: true })
);
export const supportedAuthenticationTypesAsync = jest.fn(() =>
  Promise.resolve([1, 2])
);

export default {
  hasHardwareAsync,
  isEnrolledAsync,
  authenticateAsync,
  supportedAuthenticationTypesAsync,
};
