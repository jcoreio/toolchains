const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const JSON5 = require('json5')
const { globExists } = require('@jcoreio/toolchain/util/glob.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

async function getRootTsconfig() {
  if (await fs.pathExists('tsconfig.json')) {
    return JSON5.parse(await fs.readFile('tsconfig.json', 'utf8'))
  }
}

module.exports = [
  async function getConfigFiles({ fromVersion }) {
    if (fromVersion) return {}
    const rootTsconfig = await getRootTsconfig()
    const lib =
      rootTsconfig &&
      rootTsconfig.compilerOptions &&
      rootTsconfig.compilerOptions.lib
    const overwrite =
      !rootTsconfig ||
      !rootTsconfig.extends ||
      !rootTsconfig.extends.includes('@jcoreio/toolchain')
    const buildExclude = ['node_modules', 'test']
    if (await globExists('src/**/__tests__')) {
      buildExclude.push('src/**/__tests__')
    }
    for (const extension of getPluginsArraySync('sourceExtensions')) {
      for (const suffix of ['spec', 'test']) {
        const pattern = `src/**/*.${suffix}.${extension}`
        if (await globExists(pattern, { ignore: 'src/**/__tests__/**' })) {
          buildExclude.push(pattern)
        }
      }
    }
    return {
      'tsconfig.json': {
        content: JSON.stringify(
          {
            extends:
              './node_modules/@jcoreio/toolchain-typescript/tsconfig.json',
            include: [
              './src',
              './test',
              ...(rootTsconfig && rootTsconfig.include ?
                rootTsconfig.include.filter(
                  (i) => !/^(\.\/)?(src|test)(\/|$)/.test(i)
                )
              : []),
            ],
            exclude: ['node_modules'],
            ...(lib && { compilerOptions: { lib } }),
          },
          null,
          2
        ),
        overwrite,
      },
      'tsconfig.build.json': {
        content: JSON.stringify(
          {
            extends: './tsconfig.json',
            include: ['./src'],
            exclude: buildExclude,
            compilerOptions: {
              outDir: './dist',
              declaration: true,
              noEmit: false,
              emitDeclarationOnly: true,
            },
          },
          null,
          2
        ),
        overwrite,
      },
    }
  },
]
