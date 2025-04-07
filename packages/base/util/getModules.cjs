const fs = require('./projectFs.cjs')
const { glob } = require('./glob.cjs')
const path = require('path')

module.exports = async function getModules(packageJsonFile) {
  const cjs = new Set()
  const esm = new Set()

  const cwd = path.dirname(packageJsonFile)

  const {
    type = 'commonjs',
    main,
    module,
    exports,
  } = await fs.readJson(packageJsonFile)

  const defaultType = type
  function checkFile(
    file,
    type = file ?
      /\.cjs$/.test(file) ? 'commonjs'
      : /\.mjs$/.test(file) ? 'module'
      : /\.js$/.test(file) ? defaultType
      : undefined
    : undefined
  ) {
    if (!file) return
    if (type === 'commonjs') cjs.add(file)
    else if (type === 'module') esm.add(file)
  }

  checkFile(main)
  checkFile(module)

  async function checkExport(exp, type) {
    if (typeof exp === 'string') {
      if (exp.includes('*')) {
        const files = [
          ...(await glob(exp, { cwd })),
          ...(await glob(exp.replace(/\/?\*/g, '/**/*'), { cwd })),
        ]
        for (const file of files) checkFile(file, type)
      } else {
        checkFile(exp, type)
      }
    } else if (exp instanceof Object) {
      for (const [key, value] of Object.entries(exp)) {
        await checkExport(
          value,
          type ||
            (key === 'require' ? 'commonjs'
            : key === 'import' ? 'module'
            : undefined)
        )
      }
    }
  }

  await checkExport(exports)

  const resolvePath = (f) => path.resolve(cwd, f)

  return {
    cjs: [...new Set([...cjs].map(resolvePath))],
    esm: [...new Set([...esm].map(resolvePath))],
  }
}
