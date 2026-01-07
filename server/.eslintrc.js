module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'linebreak-style': 'off',
    indent: 'off',
    quotes: 'off',
    semi: 'off'
  }
};
