module.exports = {
  extends: [require.resolve('../packages/base//eslint.config.cjs')],
  env: {
    node: true,
    es2018: true,
  },
}
