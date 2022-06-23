const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')
const Path = require('path')
const { projectDir } = require('../util/findUps.cjs')
const fs = require('../util/projectFs.cjs')
const clean = require('./clean.cjs')

exports.run = async function build(args = []) {
  await clean.run()
  await fs.mkdirs('dist')

  const packageJson = await fs.readJson('package.json')
  await getPluginsAsyncFunction('buildDistPackageJson')(packageJson)
  // eslint-disable-next-line no-console
  console.error('package.json -> dist/package.json')
  await fs.writeJson('dist/package.json', packageJson, { spaces: 2 })

  const ignoreEnoent = (err) => {
    if (err.code !== 'ENOENT') throw err
  }
  const filter = (src, dest) => {
    // eslint-disable-next-line no-console
    console.error(
      Path.relative(projectDir, src),
      '->',
      Path.relative(projectDir, dest)
    )
    return true
  }
  await Promise.all(
    ['pnpm-lock.yaml', 'README.md', 'LICENSE.md'].map((file) =>
      fs.copy(file, `dist/${file}`, { filter })
    )
  ).catch(ignoreEnoent)

  await getPluginsAsyncFunction('compile')(args)
  await getPluginsAsyncFunction('build')(args)
}
exports.description = 'build output directory'
