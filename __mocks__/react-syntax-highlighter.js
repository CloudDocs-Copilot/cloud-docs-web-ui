// Mock for react-syntax-highlighter
const React = require('react');

const Prism = ({ children }) => React.createElement('pre', { 'data-testid': 'syntax-highlighter' }, children);

module.exports = {
  Prism,
  Light: Prism,
  PrismLight: Prism,
};
