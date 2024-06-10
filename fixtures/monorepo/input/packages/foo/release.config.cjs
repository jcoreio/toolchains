/* eslint-env node, es2018 */
const base = require('@jcoreio/toolchain-semantic-release/release.config.cjs')
module.exports = {
  ...base,
  plugins: base.plugins.filter(p => /semantic-release\/(commit-analyzer|release-notes-generator)/.test(Array.isArray(p) ? p[0] : p))
}
