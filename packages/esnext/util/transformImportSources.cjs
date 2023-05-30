const fs = require('fs-extra')
const { parseAsync } = require('babel-parse-wild-code')
const getImportSources = require('./getImportSources.cjs')

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
    replacements.push({ value: replacement, start, end })
  }
  replacements.sort((a, b) => a.start - b.start)

  const parts = []
  let end = 0
  for (const r of replacements) {
    if (r.start > end) {
      parts.push(source.substring(end, r.start))
    }
    parts.push(JSON.stringify(r.value))
    end = r.end
  }
  if (end < source.length) {
    parts.push(source.substring(end))
  }

  return parts.join('')
}
module.exports = transformImportSources
