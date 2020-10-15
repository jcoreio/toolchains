#!/usr/bin/env node

const path = require('path')
const glob = require('glob')

function buildConditionalExports(dist) {
  const _exports = { './package.json': './package.json' }

  for (let file of glob.sync('**.{js,cjs,mjs}', { cwd: dist })) {
    file = './' + file
    const ext = path.extname(file)
    let exported = file.replace(/\.[^./\\]+$/, '')
    if (path.basename(file) === `index${ext}`) {
      exported = path.dirname(exported)
    }
    const forExported = _exports[exported] || (_exports[exported] = {})
    forExported[ext === '.mjs' ? 'import' : 'require'] = file
  }

  return _exports
}

module.exports = buildConditionalExports

if (require.main === module) {
  buildConditionalExports('dist')
}
