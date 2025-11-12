import path from 'path'
import { fileURLToPath } from 'url'
import { resolve, load as wrappedLoad } from 'babel-register-esm'
import fs from 'fs-extra'
import { packageJson } from '@jcoreio/toolchain/util/findUps.cjs'

export { resolve }

export async function load(url, context, nextLoad) {
  // some versions of node support --experimental-default-type, but it was removed in Node 23.
  // Since we allow the project to omit `type` in `package.json` and transpile the same source
  // code to CJS and ESM, we need to set the module type based upon the mode the toolchain is
  // running in here for Node >=23.
  if (context.format == null && !url.includes('/node_modules/')) {
    const file = url.startsWith('file:') ? fileURLToPath(url) : url
    const extension = path.extname(file)
    if (
      extension === '.js' ||
      extension === '.jsx' ||
      extension === '.ts' ||
      extension === '.tsx'
    ) {
      return await wrappedLoad(
        url,
        {
          ...context,
          format:
            (
              extension.startsWith('.js') &&
              packageJson.type !== 'module' &&
              (await fs.pathExists(file))
            ) ?
              'commonjs'
            : process.env.JCOREIO_TOOLCHAIN_ESM ? 'module'
            : 'commonjs',
        },
        nextLoad
      )
    }
  }
  return await nextLoad(url, context)
}
