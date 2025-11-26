const path = require('path')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const { glob } = require('@jcoreio/toolchain/util/glob.cjs')

module.exports = async function fixSourceMaps() {
  const mapFiles = await glob(
    path.join('dist', '**', '*.{js,cjs,mjs,d.ts,d.cts,d.mts}.map')
  )
  await Promise.all(
    mapFiles.map(async (file) => {
      const content = await fs.readJson(file)
      const { sources, sourcesContent } = content
      let changed = false
      for (let i = 0; i < sources.length; i++) {
        if (sources[i].startsWith('../src/')) {
          changed = true
          sources[i] = sources[i].substring('../'.length)
        }
        if (sourcesContent && sourcesContent[i] != null) {
          changed = true
          sourcesContent[i] = null
        }
      }
      if (changed) await fs.writeJson(file, content)
    })
  )
}
