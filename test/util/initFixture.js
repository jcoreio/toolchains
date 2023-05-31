#!/usr/bin/env bash

const copyFixture = require('./copyFixture')
const runInit = require('./runInit')

async function initFixture(name) {
  const linkdir = await copyFixture(name)
  await runInit(linkdir)
  return linkdir
}
module.exports = initFixture

if (require.main === module) {
  const name = process.argv[2]
  if (!name) {
    // eslint-disable-next-line no-console
    console.error(`Usage: ${process.argv.slice(0, 2).join(' ')} <fixture-name>`)
    process.exit(1)
  }
  initFixture(name)
}
