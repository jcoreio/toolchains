const Path = require('path')
const {
  toolchainConfig,
  packageJson,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { glob } = require('@jcoreio/toolchain/util/glob.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const hasTSSourcesSync = require('@jcoreio/toolchain/util/hasTSSourcesSync.cjs')
const babel = require('@babel/core')

module.exports = [
  [
    async function compile(args = []) {
      if (hasTSSourcesSync()) {
        await execa('tsc', [
          '-p',
          'tsconfig.build.json',
          ...(toolchainConfig.sourceMaps ? ['--declarationMap'] : []),
        ])
      }
      const dtsFiles = await glob(Path.join('dist', '**', '*.d.ts'))
      await Promise.all(
        dtsFiles.map(async (src) => {
          const dest = src.replace(
            /\.d\.ts$/,
            packageJson.type === 'module' ? '.d.cts' : '.d.mts'
          )
          if (await fs.pathExists(dest)) return
          // eslint-disable-next-line no-console
          console.error(src, '->', dest)
          const content = await fs.readFile(src, 'utf8')
          const parserOpts = {
            sourceType: 'unambiguous',
            allowImportExportEverywhere: true,
            plugins: [
              'asyncGenerators',
              'bigInt',
              'classProperties',
              'classPrivateProperties',
              'classPrivateMethods',
              'classStaticBlock',
              'dynamicImport',
              'exportNamespaceFrom',
              'exportDefaultFrom',
              'functionSent',
              'importMeta',
              'logicalAssignment',
              'moduleStringNames',
              'nullishCoalescingOperator',
              'numericSeparator',
              'objectRestSpread',
              'optionalCatchBinding',
              'optionalChaining',
              'privateIn',
              'topLevelAwait',
              ['typescript', { dts: true }],
              'decorators-legacy',
            ],
          }
          const [cts, mts] = await Promise.all([
            babel.transformAsync(content, {
              filename: src,
              babelrc: false,
              sourceMaps: true,
              parserOpts,
              plugins: [
                [
                  '@jcoreio/toolchain-esnext/util/babelPluginResolveImports.cjs',
                  {
                    outputExtension:
                      packageJson.type === 'module' ? '.cjs' : '.js',
                  },
                ],
                function ({ types: t }) {
                  return {
                    visitor: {
                      ExportDefaultDeclaration(path) {
                        const { declaration } = path.node
                        if (declaration.type === 'Identifier') {
                          path.replaceWith(t.tsExportAssignment(declaration))
                        } else if (
                          declaration.id &&
                          declaration.id.type === 'Identifier'
                        ) {
                          path.replaceWithMultiple([
                            Object.assign(declaration, { declare: true }),
                            t.tsExportAssignment(
                              t.identifier(declaration.id.name)
                            ),
                          ])
                        }
                      },
                    },
                  }
                },
              ],
            }),
            await babel.transformAsync(content, {
              filename: src,
              babelrc: false,
              sourceMaps: true,
              parserOpts,
              plugins: [
                [
                  '@jcoreio/toolchain-esnext/util/babelPluginResolveImports.cjs',
                  {
                    outputExtension:
                      packageJson.type === 'module' ? '.js' : '.mjs',
                  },
                ],
              ],
            }),
          ])
          const ctsFile = packageJson.type === 'module' ? dest : src
          const mtsFile = packageJson.type === 'module' ? src : dest
          cts.map.file = Path.basename(ctsFile)
          mts.map.file = Path.basename(mtsFile)
          await Promise.all([
            fs.writeFile(
              ctsFile,
              `${cts.code}\n//# sourceMappingURL=${Path.basename(ctsFile)}.map`,
              'utf8'
            ),
            fs.writeJson(`${ctsFile}.map`, cts.map),
            fs.writeFile(
              mtsFile,
              `${mts.code}\n//# sourceMappingURL=${Path.basename(mtsFile)}.map`,
              'utf8'
            ),
            fs.writeJson(`${mtsFile}.map`, mts.map),
          ])
        })
      )
    },
    { after: ['@jcoreio/toolchain'], before: ['@jcoreio/toolchain-esnext'] },
  ],
]
