const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const { promisify } = require('util')
const babel = require('@babel/core')
const { dependencies } = require('../package.json')

async function runBabel({
  srcDir,
  destDir,
  outFileExtension,
  ...babelOptions
}) {
  await fs.mkdirs(destDir)
  for (const file of await promisify(glob)(
    dependencies['@babel/preset-typescript']
      ? dependencies['@babel/preset-react']
        ? '**.{ts,tsx}'
        : '**.ts'
      : '**.js',
    {
      cwd: srcDir,
    }
  )) {
    const srcFile = path.join(srcDir, file)
    const destFile = path.join(
      destDir,
      outFileExtension ? file.replace(/\.[^.]+$/, outFileExtension) : file
    )
    const { mode } = await fs.stat(srcFile)
    const { code } = await babel.transformFileAsync(srcFile, babelOptions)
    await fs.writeFile(destFile, code, { encoding: 'utf8', mode })
    console.log(`${srcFile} -> ${destFile}`) // eslint-disable-line no-console
  }
}

module.exports = runBabel
