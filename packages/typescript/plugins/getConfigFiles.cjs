const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const JSON5 = require('json5')

async function getRootTsconfig() {
  if (await fs.pathExists('tsconfig.json')) {
    return JSON5.parse(await fs.readFile('tsconfig.json', 'utf8'))
  }
}

module.exports = [
  async function getConfigFiles() {
    const rootTsconfig = await getRootTsconfig()
    const lib =
      rootTsconfig &&
      rootTsconfig.compilerOptions &&
      rootTsconfig.compilerOptions.lib
    const overwrite =
      !rootTsconfig ||
      !rootTsconfig.extends ||
      !rootTsconfig.extends.includes('@jcoreio/toolchain')
    return {
      'tsconfig.json': {
        content: JSON.stringify(
          {
            extends:
              './node_modules/@jcoreio/toolchain-typescript/tsconfig.json',
            include: ['./src', './test'],
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
            exclude: ['node_modules', './src/**/*.spec.ts', './test'],
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
