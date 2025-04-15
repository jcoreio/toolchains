const { defineConfig } = require('eslint/config')
const react = require('eslint-plugin-react')
const { toolchainPackages } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  () =>
    defineConfig([
      {
        files: ['**/*.{js,jsx,mjsx,cjsx,tsx,mtsx,ctsx}'],
        ...react.configs.flat.recommended,
        rules: {
          ...react.configs.flat.recommended.rules,
          'react/jsx-boolean-value': ['error', 'never'],
          'react/jsx-equals-spacing': ['error', 'never'],
          'react/jsx-closing-bracket-location': 'error',
          'react/jsx-curly-spacing': ['error', 'never'],
          'react/jsx-indent-props': 0,
          'react/jsx-key': 'error',
          'react/jsx-tag-spacing': 'error',
          'react/no-did-mount-set-state': 0,
          'react/no-unknown-property': 0,
          'react/jsx-wrap-multilines': 'error',
        },
        settings: {
          react: {
            pragma: 'React',
            version: 'detect',
            ...(toolchainPackages.includes('@jcoreio/toolchain-flow') && {
              flowVersion: 'detect',
            }),
          },
        },
      },
    ]),
]
