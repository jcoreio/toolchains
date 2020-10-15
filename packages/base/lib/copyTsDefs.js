#!/usr/bin/env node

const copy = require('./copy')

async function copyTsDefs() {
  await copy({ srcDir: 'src', pattern: '**.d.ts', destDir: 'dist' })
}
module.exports = copyTsDefs

if (require.main === module) {
  copyTsDefs()
}
