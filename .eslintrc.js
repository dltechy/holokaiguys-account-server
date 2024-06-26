const fs = require('fs');

const { compilerOptions } = JSON.parse(fs.readFileSync('./tsconfig.json'));

const paths = Object.keys(compilerOptions.paths)
  .map((key) => key.slice(0, -2))
  .sort();

module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  ignorePatterns: ['!.lintstagedrc.js', 'dist/'],
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '.lintstagedrc.js', 'jest*.config.js'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              String: {
                message: 'Use string instead',
                fixWith: 'string',
              },
              Boolean: {
                message: 'Use boolean instead',
                fixWith: 'boolean',
              },
              Number: {
                message: 'Use number instead',
                fixWith: 'number',
              },
              Symbol: {
                message: 'Use symbol instead',
                fixWith: 'symbol',
              },
            },
            extendDefaults: false,
          },
        ],
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            accessibility: 'explicit',
            overrides: {
              constructors: 'no-public',
            },
          },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
          },
          {
            selector: 'import',
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
          },
          {
            selector: ['variable', 'property'],
            format: ['camelCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
          },
          {
            selector: ['enumMember', 'typeLike'],
            format: ['PascalCase'],
          },
          {
            selector: 'variable',
            modifiers: ['destructured'],
            format: null,
          },
          {
            selector: 'property',
            modifiers: ['requiresQuotes'],
            format: null,
          },
        ],
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
        'no-shadow': 'off',
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.ts'],
          },
          typescript: {
            project: 'tsconfig.json',
          },
        },
      },
    },
  ],
  plugins: ['@stylistic', 'simple-import-sort'],
  root: true,
  rules: {
    '@stylistic/spaced-comment': ['error', 'always', { markers: ['/'] }],
    'class-methods-use-this': 'off',
    curly: ['error', 'all'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'no-console': 'error',
    'no-empty-function': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'no-useless-constructor': 'off',
    'prefer-const': ['error', { destructuring: 'all' }],
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^\\u0000'],
          ['^@?\\w'],
          ['^'],
          ...paths.map((path) => [`^${path}(\\/)`]),
          ['^\\.'],
        ],
      },
    ],
  },
};
