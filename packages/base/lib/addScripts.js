#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')

async function addScripts() {
  if (!process.env.INIT_CWD) return
  const packageJsonPath = path.resolve(process.env.INIT_CWD, 'package.json')
  if (packageJsonPath === require.resolve('../package.json')) return

  const packageJson = await fs.readJson(packageJsonPath)

  if (
    packageJson.scripts &&
    packageJson.scripts.toolchain &&
    packageJson.scripts.tc
  )
    return
  if (!packageJson.scripts) packageJson.scripts = {}
  packageJson.scripts.toolchain = packageJson.scripts.tc = 'toolchain'
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
  console.log('added toolchain scripts to', packageJsonPath) // eslint-disable-line no-console
}

module.exports = addScripts

if (require.main === module) addScripts()
