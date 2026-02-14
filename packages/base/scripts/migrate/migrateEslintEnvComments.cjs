const { gte } = require('semver')

async function migrateEslintEnvComments({ fromVersion }) {
  // istanbul ignore next
  if (fromVersion && gte(fromVersion, '5.10.1')) {
    return
  }

  const fs = require('../../util/projectFs.cjs')
  const { glob } = require('../../util/glob.cjs')
  const path = require('path')
  const replaceRanges = require('../../util/replaceRanges.cjs')
  const getBabelParseOpts = require('../../util/getBabelParseOpts.cjs')
  const chalk = require('chalk')
  const dedent = require('dedent-js')
  const { parse } = require('@babel/parser')

  /** env name -> array of paths from proj root to file */
  const envFileMap = new Map()
  const warnings = {}
  for (const file of await glob('**/*.{js,jsx,cjs,mjs,ts,cts,mts,tsx}', {
    dot: true,
  })) {
    function warn(warning) {
      ;(warnings[file] || (warnings[file] = [])).push(warning)
    }

    const source = await fs.readFile(file, 'utf8')
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
      const envs = match ? match[1].split(/\s*,\s*/g) : undefined
      if (envs == null) continue
      replacements.push({ start, end, value: '' })

      if (file.startsWith('src/') || file.startsWith('test/')) {
        for (const env of envs) {
          let group = envFileMap.get(env)
          if (!group) envFileMap.set(env, (group = []))
          group.push(file)
        }
      }
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
  if (!envFileMap.size) return

  const t = require('@babel/types')
  const addEslintConfigsCodemod = require('../../util/addEslintConfigsCodemod.cjs')

  const newConfigs = [...envFileMap].map(([env, files]) =>
    t.objectExpression([
      t.objectProperty(
        t.identifier('files'),
        t.arrayExpression(files.map((file) => t.stringLiteral(file)))
      ),
      t.objectProperty(
        t.identifier('languageOptions'),
        t.objectExpression([
          t.objectProperty(
            t.identifier('globals'),
            t.memberExpression(
              t.identifier('globals'),
              /^[_a-z$][_a-z0-9$]*$/.test(env) ?
                t.identifier(env)
              : t.stringLiteral(env)
            )
          ),
        ])
      ),
    ])
  )

  await fs.writeFile(
    'eslint.config.cjs',
    await addEslintConfigsCodemod({
      file: 'eslint.config.cjs',
      source: await fs.readFile('eslint.config.cjs', 'utf8'),
      configs: newConfigs,
      requireGlobals: true,
    }),
    'utf8'
  )
}

module.exports = migrateEslintEnvComments
