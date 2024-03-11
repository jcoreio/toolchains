module.exports = {
  extends: [require.resolve('./base/eslint.config.cjs')],
  env: {
    node: true,
    es2018: true,
  },
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
}
