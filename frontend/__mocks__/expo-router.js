// Mock pour expo-router
const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const useLocalSearchParams = jest.fn().mockReturnValue({});
const usePathname = jest.fn().mockReturnValue("/");
const Redirect = jest.fn().mockImplementation(({ href }) => `Redirected to ${href}`);
const Stack = jest.fn().mockImplementation(({ children }) => children);
const Tabs = Stack;

export { router, useLocalSearchParams, usePathname, Redirect, Stack, Tabs };