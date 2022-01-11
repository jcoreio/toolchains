const execa = require('../../util/execa.cjs')
const fs = require('../../util/projectFs.cjs')

async function updateGitignore() {
  const paths = {
    '/dist': 'dist',
    '.nyc_output': '.nyc_output',
    node_modules: 'node_modules',
    '/coverage': 'coverage',
  }
  const { stdout } = await execa(
    'git',
    ['check-ignore', ...Object.values(paths)],
    {
      stdio: 'pipe',
      encoding: 'utf8',
    }
  ).catch((e) => e)
  const ignored = new Set((stdout || '').split(/\r\n?|\n/gm))
  await fs.ensureFile('.gitignore')
  if (ignored.size < Object.keys(paths).length) {
    const content = await fs.readFile('.gitignore', 'utf8')

    const added = []
    for (const path in paths) {
      if (!ignored.has(paths[path])) added.push(path)
    }
    await fs.writeFile(
      '.gitignore',
      content.replace(/\n+?$/m, '\n') + added.join('\n') + '\n',
      'utf8'
    )
    // eslint-disable-next-line no-console
    console.error('updated .gitignore')
  }
}
module.exports = updateGitignore
