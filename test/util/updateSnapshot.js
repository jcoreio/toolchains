const fs = require('fs-extra')
const Path = require('path')
const { glob } = require('glob')
const fixtures = Path.resolve(__dirname, '..', '..', 'fixtures')

async function updateSnapshot(name, snapshotName) {
  const actual = Path.join(fixtures, name, 'actual')
  if (!(await fs.pathExists(actual))) {
    throw new Error(`path not found: ${Path.relative(process.cwd(), actual)}`)
  }
  const snapshot = Path.join(fixtures, name, snapshotName)
  await fs.remove(snapshot)

  const files = await glob('**', {
    cwd: actual,
    follow: true,
    dot: true,
    nodir: true,
    ignore: '**/{node_modules,coverage,.git,.nyc_output}/**',
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
          snapshot,
          Path.basename(f) === '.gitignore' ?
            Path.join(Path.dirname(f), '_.gitignore')
          : Path.basename(f) === 'lint-staged.config.cjs' ?
            Path.join(Path.dirname(f), '_lint-staged.config.cjs')
          : f
        )
      )
    })
  )

  // eslint-disable-next-line no-console
  console.error(
    `updated snapshot: ${Path.relative(
      process.cwd(),
      actual
    )} -> ${Path.relative(process.cwd(), snapshot)}`
  )
}

module.exports = updateSnapshot

if (require.main === module) {
  const name = process.argv[2]
  const snapshotName = process.argv[3]
  if (!name || !snapshotName) {
    // eslint-disable-next-line no-console
    console.error(
      `Usage: ${process.argv
        .slice(0, 2)
        .join(' ')} <fixture name> <snapshot name>`
    )
    process.exit(1)
  }
  updateSnapshot(name, snapshotName)
}
