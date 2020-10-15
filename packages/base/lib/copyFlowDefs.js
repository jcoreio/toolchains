#!/usr/bin/env node

const copy = require('./copy')
const path = require('path')

async function copyFlowDefs() {
  await copy({
    srcDir: 'src',
    pattern: '**.{js,cjs}',
    getDest: (file) =>
      path.join(
        'dist',
        /\.js\.flow$/.test(file)
          ? file
          : file.replace(/\.[^.\\/]+$/, '.js.flow')
      ),
  })
  await copy({
    srcDir: 'src',
    destDir: 'dist',
    pattern: '**.{js.flow}',
  })
}
module.exports = copyFlowDefs

if (require.main === module) {
  copyFlowDefs()
}
