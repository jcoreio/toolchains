const Path = require('path')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')
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
          const dest = src.replace(/\.d\.ts$/, '.d.mts')
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
                  { outputExtension: '.js' },
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
                  { outputExtension: '.mjs' },
                ],
              ],
            }),
          ])
          cts.map.file = Path.basename(src)
          mts.map.file = Path.basename(dest)
          await Promise.all([
            fs.writeFile(
              src,
              `${cts.code}\n//# sourceMappingURL=${Path.basename(src)}.map`,
              'utf8'
            ),
            fs.writeJson(`${src}.map`, cts.map),
            fs.writeFile(
              dest,
              `${mts.code}\n//# sourceMappingURL=${Path.basename(dest)}.map`,
              'utf8'
            ),
            fs.writeJson(`${dest}.map`, mts.map),
          ])
        })
      )
    },
    { after: ['@jcoreio/toolchain'], before: ['@jcoreio/toolchain-esnext'] },
  ],
]
