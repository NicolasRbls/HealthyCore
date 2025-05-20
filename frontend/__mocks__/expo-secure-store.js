// Create a file in __mocks__/expo-secure-store.js

const SecureStore = {
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
};

export default SecureStore;