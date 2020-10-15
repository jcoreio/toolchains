const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const { promisify } = require('util')

const displayPath = (file) => path.relative(process.cwd(), file)

async function copy({ srcDir, pattern, destDir, getDest, dot, nodir }) {
  const files = await promisify(glob)(pattern, {
    cwd: srcDir,
    dot,
    nodir: nodir !== false,
  })
  const createdDirs = new Set()
  for (const file of files) {
    const src = path.join(srcDir, file)
    const dest = getDest ? getDest(file) : path.join(destDir, file)
    let fileDestDir = path.dirname(file)
    if (fileDestDir !== '.' && !createdDirs.has(fileDestDir)) {
      await fs.mkdirs(path.dirname(dest))
      while (fileDestDir && fileDestDir !== '.' && fileDestDir !== '/') {
        createdDirs.add(fileDestDir)
        fileDestDir = path.dirname(fileDestDir)
      }
    }
    await fs.copyFile(src, dest)
    console.log(`${displayPath(src)} -> ${displayPath(dest)}`) // eslint-disable-line no-console
  }
}
module.exports = copy
