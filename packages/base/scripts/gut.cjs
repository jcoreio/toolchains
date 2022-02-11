#!/usr/bin/env node

const fs = require('../util/projectFs.cjs')

async function gut(args = []) {
  const gutProjectPackageJson = require('./gut/gutProjectPackageJson.cjs')

  await Promise.all(
    require('./gut/removeFiles.cjs').map(async (file) => {
      const exists = await fs.pathExists(file)
      if (exists) {
        await fs.remove(file)
        // eslint-disable-next-line no-console
        console.error('removed', file)
      }
    })
  )

  await gutProjectPackageJson()
}

exports.description = 'remove files and dependencies from old project skeletons'
exports.run = gut

if (require.main === module) {
  gut().then(
    () => process.exit(0),
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error.stack)
      process.exit(error.exitCode != null ? error.exitCode : 1)
    }
  )
}
