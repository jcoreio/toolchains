const glob = require('../../util/glob.cjs')
const fs = require('../../util/projectFs.cjs')
const path = require('path')

async function migrateMoveTypeDefs() {
  for (const src of await glob('*.{d.ts,js.flow}')) {
    const dest = path.join('src', src)
    await fs.move(src, dest)
    // eslint-disable-next-line no-console
    console.error(`moved ${src} -> ${dest}`)
  }
}

module.exports = migrateMoveTypeDefs
