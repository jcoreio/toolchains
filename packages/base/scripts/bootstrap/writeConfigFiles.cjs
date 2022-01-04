const dedent = require('dedent-js')
const { name } = require('../../package.json')
const fs = require('../../util/projectFs.cjs')

async function writeConfigFiles() {
  const files = {
    '.eslintrc.js': dedent`
      module.exports = {
        extends: [require.resolve('${name}/eslintConfig.cjs')],
        env: {
          node: true,
        },
      }
    `,
  }
  for (const file of [
    '.mocharc.cjs',
    'commitlint.config.cjs',
    'githooks.cjs',
    'lint-staged.config.cjs',
    'nyc.config.cjs',
    'prettier.config.cjs',
  ]) {
    files[file] = dedent`
      module.exports = {
        ...require('${name}/${file}'),
      }

    `
  }
  for (const file in files) {
    await fs.writeFile(file, files[file], 'utf8')
    // eslint-disable-next-line no-console
    console.error(`wrote ${file}`)
  }
}

module.exports = writeConfigFiles
