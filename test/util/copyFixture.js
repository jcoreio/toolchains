const fs = require('fs-extra')
const Path = require('path')
const fixtures = Path.resolve(__dirname, '..', '..', 'fixtures')
const packages = Path.resolve(__dirname, '..', '..', 'packages')
const os = require('os')
const { glob } = require('glob')

async function copyFixture(name, inputDir = 'input') {
  const src = Path.join(fixtures, name, inputDir)
  const dest = Path.join(os.tmpdir(), 'toolchains', name)
  const destlink = Path.join(fixtures, name, 'actual')
  await Promise.all([fs.remove(dest), fs.remove(destlink)])
  await fs.copy(src, dest, {
    filter: (src) => !/node_modules/.test(src),
  })
  await fs.ensureSymlink(
    packages,
    Path.join(os.tmpdir(), 'toolchains', 'packages')
  )
  await fs.ensureSymlink(dest, destlink)
  for (const file of await glob(
    Path.join(dest, '**', '_lint-staged.config.cjs')
  )) {
    await fs.rename(file, file.replace(/_lint-staged/, 'lint-staged'))
  }
  return destlink
}

module.exports = copyFixture

if (require.main === module) {
  const [, , name, inputDir] = process.argv
  if (!name) {
    // eslint-disable-next-line no-console
    console.error(
      `Usage: ${process.argv.slice(0, 2).join(' ')} <fixture-name> [input-dir]`
    )
    process.exit(1)
  }
  copyFixture(name, inputDir)
}
