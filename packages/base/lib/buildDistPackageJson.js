#!/usr/bin/env node

const path = require('path')
const fs = require('fs-extra')
const buildConditionalExports = require('./buildConditionalExports')
const parseDependencies = require('./parseDependencies')
const toolchainPackageJson = require('../package.json')
const toolchainName = toolchainPackageJson.name

async function buildDistPackageJson(dist) {
  const packageJson = await fs.readJson('package.json')
  const exports = buildConditionalExports(dist)
  const main = exports['.'] ? exports['.'].require : null
  const module = exports['.'] ? exports['.'].import : null
  if (!packageJson.exports) packageJson.exports = exports
  packageJson.exports['./package.json'] = './package.json'
  if (!packageJson.main && main) packageJson.main = main
  if (!packageJson.module && module) packageJson.module = module
  delete packageJson.devDependencies
  delete packageJson.husky
  delete packageJson.prettier
  delete packageJson.eslintConfig
  delete packageJson['lint-staged']
  delete packageJson.commitlint
  delete packageJson.nyc
  if (packageJson.config) delete packageJson.config.commitizen
  delete packageJson.renovate
  if (packageJson.scripts) {
    delete packageJson.scripts.test
    delete packageJson.scripts.prepublish
    delete packageJson.scripts.prepublishOnly
    delete packageJson.scripts.toolchain
    delete packageJson.scripts.tc
  }
  delete packageJson[toolchainName]
  const parsedDependencies = await parseDependencies(dist)
  for (const dep of ['@babel/runtime', 'prop-types']) {
    if (parsedDependencies.has(dep)) {
      const dependencies =
        packageJson.dependencies || (packageJson.dependencies = {})
      dependencies[dep] = toolchainPackageJson.dependencies[dep]
    } else if (packageJson.dependencies) {
      delete packageJson.dependencies[dep]
    }
  }
  await fs.writeJson(path.join(dist, 'package.json'), packageJson, {
    spaces: 2,
  })
}

module.exports = buildDistPackageJson

if (require.main === module) {
  buildDistPackageJson('dist')
}
