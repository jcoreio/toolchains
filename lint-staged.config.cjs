/* eslint-env node */
module.exports = {
  ...Object.fromEntries(
    [
      ...Object.entries(require('@jcoreio/toolchain/lint-staged.config.cjs')),
    ].map(([key, value]) => [`./{packages,test}/${key}`, value])
  ),
  ...Object.fromEntries(
    [
      ...Object.entries(require('@jcoreio/toolchain/lint-staged.config.cjs')),
    ].map(([key, value]) => [`./${key}`, value])
  ),
}
