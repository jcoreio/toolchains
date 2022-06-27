/* eslint-env node, es2018 */
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
