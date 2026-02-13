const { gte } = require('semver')

async function migrateEslintEnvComments({ fromVersion }) {
  // istanbul ignore next
  if (fromVersion && gte(fromVersion, '5.10.0')) {
    return
  }

  const fs = require('../../util/projectFs.cjs')
  const { glob } = require('../../util/glob.cjs')
  const path = require('path')
  const replaceRanges = require('../../util/replaceRanges.cjs')
  const getBabelParseOpts = require('../../util/getBabelParseOpts.cjs')
  const chalk = require('chalk')
  const dedent = require('dedent-js')

  const warnings = {}
  for (const file of await glob('**/*.{js,jsx,cjs,mjs,ts,cts,mts,tsx}')) {
    function warn(warning) {
      ;(warnings[file] || (warnings[file] = [])).push(warning)
    }

    const { parse } = require('@babel/parser')
    const source = await fs.readFile(file)
    let parsed
    try {
      parsed = parse(source, getBabelParseOpts(file))
    } catch (error) {
      warn(`parse error: ${error.message}`)
      continue
    }

    if (!parsed || !('comments' in parsed) || !Array.isArray(parsed.comments)) {
      continue
    }

    const replacements = []
    for (const comment of parsed.comments) {
      const { start, end, value } = comment
      const match = /^\s*eslint-env\s+(.*?)\s*$/.exec(value)
      const envs = match ? match[1] : undefined
      if (envs == null) continue
      replacements.push({ start, end, value: '' })
    }

    if (!replacements.length) continue
    await fs.writeFile(file, replaceRanges(source, replacements), 'utf8')
    // eslint-disable-next-line no-console
    console.error(
      `removed eslint-env comments from ${path.relative(process.cwd(), file)}`
    )
  }

  if (warnings.length) {
    for (const [file, fileWarnings] of Object.entries(warnings)) {
      // eslint-disable-next-line no-console
      console.warn(
        chalk.yellow(
          dedent`
            WARNING: ${file} could not be completely migrated because of the following:
              ${fileWarnings.map((w) => `- ${w}`).join('\n  ')} 
            
          `
        )
      )
    }
  }
}

module.exports = migrateEslintEnvComments
