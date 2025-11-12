import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { resolve, load as wrappedLoad } from 'babel-register-esm'
import fs from 'fs-extra'
import { packageJson, projectDir } from '@jcoreio/toolchain/util/findUps.cjs'
import hasTSSources from '@jcoreio/toolchain/util/hasTSSources.cjs'

const projectDirPrefix = pathToFileURL(projectDir) + '/'

export { resolve }

export async function load(url, context, nextLoad) {
  if (!url.startsWith('file:') || url.includes('/node_modules/')) {
    return await nextLoad(url, context)
  }
  const file = fileURLToPath(url)
  // some versions of node support --experimental-default-type, but it was removed in Node 23.
  // Since we allow the project to omit `type` in `package.json` and transpile the same source
  // code to CJS and ESM, we need to set the module type based upon the mode the toolchain is
  // running in here for Node >=23.
  if (context.format == null && url.startsWith(projectDirPrefix)) {
    const extension = path.extname(file)
    if (
      extension === '.ts' ||
      extension === '.tsx' ||
      (!(await hasTSSources()) && (extension === '.js' || extension === '.jsx'))
    ) {
      return await wrappedLoad(
        url,
        {
          ...context,
          format:
            (
              extension.startsWith('.js') &&
              packageJson.type !== 'module' &&
              (await fs.pathExists(file)) &&
              !(await hasTSSources())
            ) ?
              'commonjs'
            : process.env.JCOREIO_TOOLCHAIN_ESM ? 'module'
            : 'commonjs',
        },
        nextLoad
      )
    }
  }
  return await wrappedLoad(url, context, nextLoad)
}
