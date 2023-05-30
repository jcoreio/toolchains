const { promisify } = require('util')
const _resolve = require('resolve')
const resolve = promisify(_resolve)
const path = require('path')
const fs = require('fs-extra')

module.exports = async function resolveImportSource({ file, source }) {
  const basedir = path.dirname(file)
  if (source.startsWith('.')) {
    const resolved = await resolve(source, {
      basedir,
      extensions: [
        path.extname(file.replace(/\.flow$/, '')),
        '.mjs',
        '.cjs',
        '.js',
      ],
    })
    const result = path.relative(basedir, resolved)
    return result.startsWith('.') ? result : `./${result}`
  }
  const match = /^((?:@[^/]+\/)?[^/]+)(?:\/(.+))?$/.exec(source)
  if (!match) return source
  const [, pkg, subpath] = match
  if (!subpath) return source
  const packageJsonFile = await resolve(`${pkg}/package.json`)
  const packageJson = await fs.readJson(packageJsonFile)
  const exportMap = packageJson ? packageJson.exports : undefined
  if (exportMap && exportMap[`./${subpath}`]) return source
  const resolved = await resolve(source, {
    basedir,
    extensions: [path.extname(file), '.mjs', '.cjs', '.js'],
  })
  return `${pkg}/${path.relative(path.dirname(packageJsonFile), resolved)}`
}
