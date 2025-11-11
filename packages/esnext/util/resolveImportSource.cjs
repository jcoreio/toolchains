const resolve = require('resolve/sync')
const path = require('path')
const fs = require('fs-extra')
const builtinModules = new Set(require('module').builtinModules)

module.exports = function resolveImportSource({
  file,
  source,
  outputExtension,
}) {
  if (
    /(\.d\.ts|\.[cm]?jsx?)$/i.test(source) ||
    source.startsWith('node:') ||
    builtinModules.has(source)
  ) {
    return source
  }

  const basedir = path.dirname(file)
  if (source.startsWith('.')) {
    if (/\.[cm]?tsx?$/i.test(source) && /\.d\.[cm]?ts$/i.test(file)) {
      source = source.replace(/\.[^.]+$/, '')
    }
    const resolved = resolve(source, {
      basedir,
      extensions: [
        path.extname(file.replace(/\.flow$/, '')),
        ...(/\.d\.[cm]?ts$/i.test(file) ?
          [file.replace(/.*(\.d\.[cm]?ts)$/i, '$1')]
        : []),
        '.mjs',
        '.cjs',
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.cts',
        '.ctsx',
        '.mts',
        '.mtsx',
      ],
    })
    let result = path.relative(basedir, resolved)
    if (outputExtension) result = result.replace(/\.[^\\/]+$/, outputExtension)
    return result.startsWith('.') ? result : `./${result}`
  }
  const match = /^((?:@[^/]+\/)?[^/]+)(?:\/(.+))?$/.exec(source)
  if (!match) return source
  const [, pkg, subpath] = match
  if (!subpath) return source
  try {
    const packageJsonFile = resolve(`${pkg}/package.json`, { basedir })
    const packageJson = fs.readJsonSync(packageJsonFile)
    if (packageJson && packageJson.exports) return source
    const resolved = resolve(source, {
      basedir,
      extensions: [path.extname(file), '.mjs', '.cjs', '.js'],
    })
    return `${pkg}/${path.relative(path.dirname(packageJsonFile), resolved)}`
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`failed to resolve ${JSON.stringify(source)}`, error)
    return source
  }
}
