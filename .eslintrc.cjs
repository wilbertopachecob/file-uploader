/* eslint-env node */
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: false,
  },
  ignorePatterns: [
    'server/public/**',
    'server/uploads/**',
    'server/logs/**',
    'node_modules/**',
    'front_end/node_modules/**',
    'server/node_modules/**',
    'front_end/dist/**',
  ],
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    project: false,
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {},
    },
    {
      files: ['**/*.js'],
      rules: {},
    },
    {
      files: ['front_end/tests/**/*.{j,t}s?(x)'],
      env: { jest: true },
    },
  ],
};


