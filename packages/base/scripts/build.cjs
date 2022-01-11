const Path = require('path')
const { projectDir } = require('../util/findUps.cjs')
const fs = require('../util/projectFs.cjs')
const clean = require('./clean.cjs')

exports.run = async function build(args = []) {
  await clean.run()
  const ignoreEnoent = (err) => {
    if (err.code !== 'ENOENT') throw err
  }
  await fs.mkdirs('dist')
  const filter = (src, dest) => {
    // eslint-disable-next-line no-console
    console.error(
      Path.relative(projectDir, src),
      '->',
      Path.relative(projectDir, dest)
    )
    return true
  }
  const packageJson = await fs.readJson('package.json')
  delete packageJson.devDependencies
  // eslint-disable-next-line no-console
  console.error('package.json -> dist/package.json')
  await fs.writeJson('dist/package.json', packageJson, { spaces: 2 })
  await Promise.all(
    ['pnpm-lock.yaml', 'README.md', 'LICENSE'].map((file) =>
      fs.copy(file, `dist/${file}`, { filter })
    )
  ).catch(ignoreEnoent)
  await fs.copy('src', 'dist', { filter }).catch(ignoreEnoent)
}
exports.description = 'build output directory'
