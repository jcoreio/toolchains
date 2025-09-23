import path from 'path'
import { fileURLToPath } from 'url'
import { resolve, load as wrappedLoad } from 'babel-register-esm'

export { resolve }

export async function load(url, context, nextLoad) {
  // some versions of node support --experimental-default-type, but it was removed in Node 23.
  // Since we allow the project to omit `type` in `package.json` and transpile the same source
  // code to CJS and ESM, we need to set the module type based upon the mode the toolchain is
  // running in here for Node >=23.
  if (context.format == null) {
    const extension = path.extname(fileURLToPath(url))
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
          format: process.env.JCOREIO_TOOLCHAIN_ESM ? 'module' : 'commonjs',
        },
        nextLoad
      )
    }
  }
  return await wrappedLoad(url, context, nextLoad)
}
