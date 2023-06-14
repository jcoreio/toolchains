const fs = require('fs-extra')
const Path = require('path')
const fixtures = Path.resolve(__dirname, '..', '..', 'fixtures')
const packages = Path.resolve(__dirname, '..', '..', 'packages')
const os = require('os')

async function copyFixture(name) {
  const src = Path.join(fixtures, name, 'input')
  const dest = Path.join(os.tmpdir(), 'toolchains', name)
  const destlink = Path.join(fixtures, name, 'actual')
  await Promise.all([fs.remove(dest), fs.remove(destlink)])
  await fs.copy(src, dest)
  await fs.ensureSymlink(
    packages,
    Path.join(os.tmpdir(), 'toolchains', 'packages')
  )
  await fs.ensureSymlink(dest, destlink)
  return destlink
}

module.exports = copyFixture

if (require.main === module) {
  const name = process.argv[2]
  if (!name) {
    // eslint-disable-next-line no-console
    console.error(`Usage: ${process.argv.slice(0, 2).join(' ')} <fixture-name>`)
    process.exit(1)
  }
  copyFixture(name)
}
