/**
 * @flow
 * @prettier
 */

const { describe, it } = require('mocha')
const { expect } = require('chai')

const [
  buildDistPackageJson,
] = require('../packages/base/plugins/buildDistPackageJson.cjs')

describe(`base/buildDistPackageJson`, function () {
  it(`works`, async function () {
    expect(
      await buildDistPackageJson({
        bin: './dist/bin.js',
        exports: './dist/index.js',
      })
    ).to.deep.equal({
      bin: './bin.js',
      exports: './index.js',
    })
    expect(
      await buildDistPackageJson({
        main: './dist/index.js',
        module: 'dist/index.mjs',
        browser: 'dist/browser/index.js',
        types: './dist/types/index.d.ts',
        bin: {
          cmd: './dist/cmd.js',
        },
        exports: {
          '.': './dist/index.js',
          './*.js': {
            import: './dist/*.mjs',
            require: './dist/*.js',
            types: './dist/*.d.ts',
          },
        },
        imports: {
          '#dep': {
            node: './dist/dep-node.js',
            default: './dist/dep.js',
          },
        },
      })
    ).to.deep.equal({
      main: './index.js',
      module: 'index.mjs',
      browser: 'browser/index.js',
      types: './types/index.d.ts',
      bin: {
        cmd: './cmd.js',
      },
      exports: {
        '.': './index.js',
        './*.js': {
          import: './*.mjs',
          require: './*.js',
          types: './*.d.ts',
        },
      },
      imports: {
        '#dep': {
          node: './dep-node.js',
          default: './dep.js',
        },
      },
    })
  })
})
