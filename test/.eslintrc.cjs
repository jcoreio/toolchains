module.exports = {
  extends: [require.resolve('../packages/base//eslintConfig.cjs')],
  env: {
    node: true,
    es2018: true,
  },
}
