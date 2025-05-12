const migrateExportMap = require('../../packages/base/scripts/migrate/migrateExportMap.cjs')

const { describe, it } = require('mocha')
const { expect } = require('chai')

describe('packages/base', () => {
  it('migrateExportMap', async () => {
    const input = {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.mjs',
        default: './dist/index.js',
      },
      './package.json': './dist/package.json',
      './*': {
        types: './dist/*.d.ts',
        import: './dist/*.mjs',
        default: './dist/*.js',
      },
    }
    expect(migrateExportMap(input, { outputEsm: false })).to.deep.equal(input)
    expect(migrateExportMap(input, { fromVersion: '5.5.0' })).to.deep.equal(
      input
    )
    expect(
      migrateExportMap(input, { outputEsm: true, fromVersion: '5.6.0' })
    ).to.deep.equal(input)
    expect(migrateExportMap(input)).to.deep.equal({
      '.': {
        types: {
          import: './dist/index.d.mts',
          default: './dist/index.d.ts',
        },
        import: './dist/index.mjs',
        default: './dist/index.js',
      },
      './package.json': './dist/package.json',
      './*': {
        types: {
          import: './dist/*.d.mts',
          default: './dist/*.d.ts',
        },
        import: './dist/*.mjs',
        default: './dist/*.js',
      },
    })
  })
})
