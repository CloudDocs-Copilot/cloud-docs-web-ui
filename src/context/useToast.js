// CommonJS shim for Jest resolution when tests mock '../context/useToast'
const { useToast } = require('../hooks/useToast');
module.exports = { useToast };
