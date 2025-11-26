const path = require('path')
const fs = require('fs-extra')
const { packageJson } = require('@jcoreio/toolchain/util/findUps.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')

const isActive =
  (packageJson.type === 'module' && process.env.JCOREIO_TOOLCHAIN_CJS) ||
  (packageJson.type !== 'module' && process.env.JCOREIO_TOOLCHAIN_ESM)

module.exports = function resolveAltType(specifier, basedir) {
  if (
    !isActive ||
    !specifier.startsWith('.') ||
    !/\.[tj]sx?$/i.test(specifier)
  ) {
    return undefined
  }
  // if .js/.ts, project is CJS and output mode is ESM, see if there's a .mjs/.mts file.
  // if .js/.ts, project is ESM and output mode is CJS, see if there's a .cjs/.cts file.
  // same for tsx/jsx
  const otherTypeSpecifier = specifier.replace(
    /\.([^.]+)$/,
    packageJson.type === 'module' ? '.c$1' : '.m$1'
  )
  if (fs.pathExistsSync(path.resolve(basedir, otherTypeSpecifier))) {
    return otherTypeSpecifier
  }
  if (hasTSSourcesSync() && /\.tsx?$/i.test(specifier)) {
    // if .ts, project is CJS and output mode is ESM, see if there's a .mjs file.
    // if .ts, project is ESM and output mode is CJS, see if there's a .cjs file.
    // same for tsx/jsx
    const otherTypeSpecifier = specifier.replace(
      /\.t([^.]+)$/,
      packageJson.type === 'module' ? '.cj$1' : '.mj$1'
    )
    if (fs.pathExistsSync(path.resolve(basedir, otherTypeSpecifier))) {
      return otherTypeSpecifier
    }
  }
  return undefined
}
