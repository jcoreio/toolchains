const fs = require('fs-extra')
const { parseAsync } = require('babel-parse-wild-code')
const getImportSources = require('./getImportSources.cjs')
const replaceRanges = require('@jcoreio/toolchain/util/replaceRanges.cjs')

async function transformImportSources({ file, source, ast, transform }) {
  if (!source) source = await fs.readFile(file, 'utf8')
  if (!ast) ast = await parseAsync(file, { sourceType: 'unambiguous' })
  const sources = getImportSources(ast)
  const replacements = []
  for (const { value, start, end } of sources) {
    const replacement = await transform({
      file,
      source: value,
    })
    if (replacement === value) continue
    replacements.push({ value: JSON.stringify(replacement), start, end })
  }
  return replaceRanges(source, replacements)
}
module.exports = transformImportSources
