module.exports = {
  plugins: ['eslint-plugin-react'],
  extends: ['plugin:react/recommended'],
  rules: {
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-closing-bracket-location': 'error',
    'react/jsx-curly-spacing': ['error', 'never'],
    // eslint's builtin indent rule now supports jsx
    'react/jsx-indent-props': 0,
    'react/jsx-key': 'error',
    'react/jsx-tag-spacing': 'error',
    'react/no-did-mount-set-state': 0,
    'react/no-unknown-property': 0,
    // use babel-plugin-flow-react-proptypes instead
    'react/prop-types': 0,
    'react/jsx-wrap-multilines': 'error',
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
      flowVersion: 'detect',
    },
  },
}
