module.exports = {
  extends: ['eslint:recommended'],
  plugins: ['@jcoreio/eslint-plugin-implicit-dependencies'],
  rules: {
    '@jcoreio/implicit-dependencies/no-implicit': [
      'error',
      {
        dev: true,
        peer: true,
        optional: true,
      },
    ],
    'arrow-spacing': 'error',
    'comma-spacing': 'error',
    'computed-property-spacing': ['error', 'never'],
    'eol-last': 'error',
    'jsx-quotes': 'error',
    'keyword-spacing': 'error',
    'key-spacing': [
      'error',
      {
        mode: 'strict',
      },
    ],
    'linebreak-style': 'error',
    'no-console': 'error',
    'no-unused-vars': [
      'error',
      {
        args: 'none',
        varsIgnorePattern: 'React',
      },
    ],
    'no-extra-semi': 'error',
    'no-multi-spaces': 'error',
    'no-multiple-empty-lines': 'error',
    'no-trailing-spaces': 'error',
    'no-unexpected-multiline': 'error',
    'no-unreachable': 'error',
    'no-whitespace-before-property': 'error',
    'object-shorthand': ['error', 'always'],
    'padded-blocks': ['error', 'never'],
    semi: ['error', 'never'],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
      },
    ],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': ['error', { int32Hint: false }],
    'space-unary-ops': [
      'error',
      {
        words: true,
        nonwords: false,
      },
    ],
    'rest-spread-spacing': ['error', 'never'],
  },
  overrides: [
    {
      files: ['src/**'],
      excludedFiles: ['**/__tests__/**'],
      rules: {
        '@jcoreio/implicit-dependencies/no-implicit': [
          'error',
          {
            dev: false,
            peer: true,
            optional: true,
          },
        ],
      },
    },
  ],
}
