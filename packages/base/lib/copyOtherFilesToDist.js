#!/usr/bin/env node

const copy = require('./copy')

async function copyOtherFilesToDist() {
  await copy({ srcDir: '.', pattern: '**.md', destDir: 'dist' })
}
module.exports = copyOtherFilesToDist

if (require.main === module) {
  copyOtherFilesToDist()
}
