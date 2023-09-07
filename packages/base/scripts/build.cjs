const getPluginsAsyncFunction = require('../util/getPluginsAsyncFunction.cjs')
const Path = require('path')
const { projectDir } = require('../util/findUps.cjs')
const fs = require('../util/projectFs.cjs')
const clean = require('./clean.cjs')
const glob = require('../util/glob.cjs')

exports.run = async function build(args = []) {
  await clean.run()
  await fs.mkdirs('dist')

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

  const flowFiles = await glob(Path.join('src', '**', '*.{js,mjs}.flow'))
  const flowFilesSet = new Set(flowFiles)
  await Promise.all(
    flowFiles.map(async (src) => {
      const dest = Path.join('dist', Path.relative('src', src))
      // eslint-disable-next-line no-console
      console.error(src, '->', dest)
      await fs.copy(src, dest)

      if (
        src.endsWith('.js.flow') &&
        !flowFilesSet.has(src.replace(/\.js\.flow$/, '.mjs.flow'))
      ) {
        const mjsDest = dest.replace(/\.js\.flow$/, '.mjs.flow')
        // eslint-disable-next-line no-console
        console.error(src, '->', mjsDest)
        await fs.copy(src, mjsDest)
      }
    })
  )

  const dtsFiles = await glob(Path.join('src', '**', '*.d.ts'))
  await Promise.all(
    dtsFiles.map(async (src) => {
      const dest = Path.join('dist', Path.relative('src', src))
      // eslint-disable-next-line no-console
      console.error(src, '->', dest)
      await fs.copy(src, dest)
    })
  )

  await getPluginsAsyncFunction('compile')(args)
  await getPluginsAsyncFunction('build')(args)

  const packageJson = await fs.readJson('package.json')
  await getPluginsAsyncFunction('buildDistPackageJson')(packageJson)
  // eslint-disable-next-line no-console
  console.error('package.json -> dist/package.json')
  await fs.writeJson('dist/package.json', packageJson, { spaces: 2 })
}
exports.description = 'build dist directory'
