// Mock for react-pdf
const React = require('react');

const pdfjs = {
  version: '3.11.174',
  GlobalWorkerOptions: {
    workerSrc: ''
  }
};

const Document = ({ children }) => React.createElement('div', { 'data-testid': 'pdf-document' }, children);
const Page = ({ pageNumber }) => React.createElement('div', { 'data-testid': 'pdf-page', 'data-page': pageNumber }, `Page ${pageNumber}`);

module.exports = {
  pdfjs,
  Document,
  Page
};
