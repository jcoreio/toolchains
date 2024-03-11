const fs = require('./projectFs.cjs')
const glob = require('./glob.cjs')
const path = require('path')

module.exports = async function getModules(packageJsonFile) {
  const cjs = new Set()
  const esm = new Set()

  const {
    type = 'commonjs',
    main,
    module,
    bin,
    exports,
  } = await fs.readJson(packageJsonFile)

  const defaultType = type
  function checkFile(
    file,
    type = file
      ? /\.cjs$/.test(file)
        ? 'commonjs'
        : /\.mjs$/.test(file)
        ? 'module'
        : /\.js$/.test(file)
        ? defaultType
        : undefined
      : undefined
  ) {
    if (!file) return
    if (type === 'commonjs') cjs.add(file)
    else if (type === 'module') esm.add(file)
  }

  checkFile(main)
  checkFile(module)
  if (typeof bin === 'string') checkFile(bin)
  else if (bin instanceof Object) {
    for (const file of Object.values(bin)) checkFile(file)
  }

  async function checkExport(exp, type) {
    if (typeof exp === 'string') {
      if (exp.includes('*')) {
        const files = await glob(exp.replace('*', '**'), {
          cwd: path.dirname(packageJsonFile),
        })
        for (const file of files) checkFile(file, type)
      } else {
        checkFile(exp, type)
      }
    } else if (exp instanceof Object) {
      for (const [key, value] of Object.entries(exp)) {
        await checkExport(
          value,
          type ||
            (key === 'require'
              ? 'commonjs'
              : key === 'import'
              ? 'module'
              : undefined)
        )
      }
    }
  }

  await checkExport(exports)

  const resolvePath = (f) => path.resolve(path.dirname(packageJsonFile), f)

  return { cjs: [...cjs].map(resolvePath), esm: [...esm].map(resolvePath) }
}
