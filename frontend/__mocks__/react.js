// __mocks__/react.js
const react = jest.requireActual('react');

module.exports = {
  ...react,
  // Ensure consistent React.createElement implementation
  createElement: react.createElement,
};