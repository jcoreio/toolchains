import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { resolve as baseResolve, load as wrappedLoad } from 'babel-register-esm'
import { projectDir } from '@jcoreio/toolchain/util/findUps.cjs'
import resolveAltType from './resolveAltType.cjs'

const projectDirPrefix = pathToFileURL(projectDir) + '/'

export async function resolve(specifier, context, nextResolve) {
  if (
    specifier.startsWith(projectDirPrefix) ||
    (specifier.startsWith('.') &&
      context.parentURL.startsWith('file:') &&
      !context.parentURL.includes('/node_modules/'))
  ) {
    const basedir = path.dirname(fileURLToPath(context.parentURL))
    if (!specifier.startsWith('.')) {
      specifier = path.relative(basedir, fileURLToPath(specifier))
      if (!specifier.startsWith('.')) specifier = `./${specifier}`
    }
    const altTypeResolved = resolveAltType(specifier, basedir)
    if (altTypeResolved) {
      return {
        url: new URL(altTypeResolved, context.parentURL).toString(),
        shortCircuit: true,
        format:
          process.env.JCOREIO_TOOLCHAIN_CJS ? 'commonjs'
          : process.env.JCOREIO_TOOLCHAIN_ESM ? 'module'
          : context.format,
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
    process.env.JCOREIO_TOOLCHAIN_ESM &&
    url.startsWith(projectDirPrefix) &&
    (!extension || /\.m?[jt]sx?$/i.test(extension))
  ) {
    context = { ...context, format: 'module' }
  }
  if (
    process.env.JCOREIO_TOOLCHAIN_CJS &&
    url.startsWith(projectDirPrefix) &&
    (!extension || /\.c?[jt]sx?$/i.test(extension))
  ) {
    context = { ...context, format: 'commonjs' }
  }
  return await wrappedLoad(url, context, nextLoad)
}
