import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { resolve as baseResolve, load as wrappedLoad } from 'babel-register-esm'
import { projectDir } from '@jcoreio/toolchain/util/findUps.cjs'
import resolveAltType from './resolveAltType.cjs'
import findUp from 'find-up'
import fs from 'fs-extra'

const projectDirPrefix = pathToFileURL(projectDir) + '/'

const packageJsonCache = new Map()
let packageJsonCacheTime = Date.now()

async function getPackageJson(cwd) {
  const now = Date.now()
  if (now - packageJsonCacheTime > 10000) {
    packageJsonCache.clear()
    packageJsonCacheTime = now
  }
  if (packageJsonCache.has(cwd)) return packageJsonCache.get(cwd)
  const packageJsonFile = await findUp('package.json', { cwd })
  const packageJson =
    packageJsonFile ?
      await fs.readJson(packageJsonFile).catch(() => undefined)
    : undefined
  packageJsonCache.set(cwd, packageJson)
  return packageJson
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('file:') || specifier.startsWith('.')) {
    const resolved = new URL(specifier, context.parentURL).toString()
    if (
      resolved.startsWith(projectDirPrefix) &&
      !resolved.includes('/node_modules/')
    ) {
      const basedir =
        context.parentURL ?
          path.dirname(fileURLToPath(context.parentURL))
        : process.cwd()
      const file = fileURLToPath(resolved)
      let relativeSpec = path.relative(basedir, file)
      if (!relativeSpec.startsWith('.')) relativeSpec = `./${relativeSpec}`
      const altTypeResolved = resolveAltType(relativeSpec, basedir)
      if (altTypeResolved) {
        return {
          url: pathToFileURL(path.resolve(basedir, altTypeResolved)).toString(),
          shortCircuit: true,
          format:
            process.env.JCOREIO_TOOLCHAIN_CJS ? 'commonjs'
            : process.env.JCOREIO_TOOLCHAIN_ESM ? 'module'
            : context.format,
        }
      }
      if (
        /\.[jt]sx?$/.test(resolved) &&
        !process.env.JCOREIO_TOOLCHAIN_CJS &&
        !process.env.JCOREIO_TOOLCHAIN_ESM
      ) {
        const packageJson = await getPackageJson(path.dirname(file))
        if (packageJson) {
          return {
            url: resolved,
            shortCircuit: true,
            format: packageJson.type || 'commonjs',
          }
        }
      }
    }
  }

  return await baseResolve(specifier, context, nextResolve)
}

export async function load(url, context, nextLoad) {
  if (!url.startsWith('file:') || url.includes('/node_modules/')) {
    return await nextLoad(url, context)
  }
  const extension = path.extname(url)
  if (
    (process.env.JCOREIO_TOOLCHAIN_ESM || extension.startsWith('.m')) &&
    url.startsWith(projectDirPrefix) &&
    (!extension || /\.m?[jt]sx?$/i.test(extension))
  ) {
    context = { ...context, format: 'module' }
  }
  if (
    (process.env.JCOREIO_TOOLCHAIN_CJS || extension.startsWith('.c')) &&
    url.startsWith(projectDirPrefix) &&
    (!extension || /\.c?[jt]sx?$/i.test(extension))
  ) {
    context = { ...context, format: 'commonjs' }
  }
  return await wrappedLoad(url, context, nextLoad)
}
