#!/usr/bin/env bash

const copyFixture = require('./copyFixture')
const runInit = require('./runInit')

async function initFixture(name, inputDir = 'input') {
  const linkdir = await copyFixture(name, inputDir)
  await runInit(linkdir)
  return linkdir
}
module.exports = initFixture

if (require.main === module) {
  const [, , name, inputDir] = process.argv
  if (!name) {
    // eslint-disable-next-line no-console
    console.error(
      `Usage: ${process.argv.slice(0, 2).join(' ')} <fixture-name> [input-dir]`
    )
    process.exit(1)
  }
  initFixture(name, inputDir)
}
