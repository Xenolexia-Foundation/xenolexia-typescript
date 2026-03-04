module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  settings: {
    'import/resolver': {
      typescript: {alwaysTryTypes: true, project: './tsconfig.json'},
      node: {extensions: ['.js', '.ts']},
    },
    'import/parsers': {'@typescript-eslint/parser': ['.ts']},
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      parserOptions: {project: './tsconfig.json'},
    },
    {
      files: [
        '**/__tests__/**/*',
        '**/*.test.*',
        '**/*.spec.*',
        '**/jest.setup.js',
        '**/jest.config.js',
      ],
      env: {jest: true, node: true},
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['*.config.js', '.eslintrc.js', 'scripts/**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        'newlines-between': 'always',
        alphabetize: {order: 'asc', caseInsensitive: true},
      },
    ],
    'import/no-duplicates': 'warn',
    'no-console': ['warn', {allow: ['warn', 'error']}],
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    'prettier/prettier': ['warn', {endOfLine: 'auto'}],
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    '*.lock',
    'dist/',
    '**/__tests__/',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],
};
