const fs = require('fs-extra')
const Path = require('path')
const glob = require('glob')
const { promisify } = require('util')
const fixtures = Path.resolve(__dirname, '..', '..', 'fixtures')

async function updateExpected(name, expectedName = 'expected-init') {
  const actual = Path.join(fixtures, name, 'actual')
  if (!(await fs.pathExists(actual))) {
    throw new Error(`path not found: ${Path.relative(process.cwd(), actual)}`)
  }
  const expected = Path.join(fixtures, name, expectedName)
  await fs.remove(expected)

  const files = await promisify(glob)('{*,**/*}', {
    cwd: actual,
    dot: true,
    nodir: true,
    ignore: ['.nyc_output/**', 'coverage/**', 'node_modules/**', '.git/**'],
  })
  const dirs = new Set()
  await Promise.all(
    files.map(async (f) => {
      const dir = Path.dirname(f)
      if (dir && !dirs.has(dir)) {
        dirs.add(dir)
        await fs.mkdirs(dir)
      }
      await fs.copy(
        Path.join(actual, f),
        Path.join(
          expected,
          Path.basename(f) === '.gitignore'
            ? Path.join(Path.dirname(f), '_.gitignore')
            : f
        )
      )
    })
  )

  // eslint-disable-next-line no-console
  console.error(
    `updated fixture: ${Path.relative(
      process.cwd(),
      actual
    )} -> ${Path.relative(process.cwd(), expected)}`
  )
}

module.exports = updateExpected

if (require.main === module) {
  const name = process.argv[2]
  if (!name) {
    // eslint-disable-next-line no-console
    console.error(`Usage: ${process.argv.slice(0, 2).join(' ')} <fixture>`)
    process.exit(1)
  }
  updateExpected(name)
}
