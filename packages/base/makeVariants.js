#!/usr/bin/env node

/* eslint-env node */

const fs = require('fs-extra')
const path = require('path')
const packageJson = require('./package.json')
const { dependencies } = packageJson

// flow-bin and typescript are shared by all toolchains in case def files are added
// and need to be checked

const variants = {
  js: {
    dependencies: new Set([
      '@babel/preset-flow',
      '@jedwards1211/eslint-config-flow',
      'eslint-plugin-flowtype',
    ]),
  },
  ts: {
    dependencies: new Set([
      '@babel/preset-typescript',
      '@jedwards1211/eslint-config-typescript',
      '@types/chai',
      '@types/mocha',
      '@types/node',
      ...Object.keys(dependencies).filter((dep) =>
        dep.startsWith('@typescript-eslint/')
      ),
    ]),
  },
}

variants['js-react'] = {
  dependencies: new Set([
    ...variants['js'].dependencies,
    '@babel/preset-react',
    '@jedwards1211/eslint-config-react',
    'babel-plugin-flow-react-proptypes',
    'enzyme',
    'enzyme-adapter-react-16',
    'eslint-plugin-react',
    'jsdom',
    'jsdom-global',
    'prop-types',
    'react',
    'react-dom',
  ]),
}

variants['ts-react'] = {
  dependencies: new Set([
    ...variants['ts'].dependencies,
    ...variants['js-react'].dependencies,
    '@types/enzyme',
    '@types/react',
    '@types/react-dom',
  ]),
}

const commonDeps = new Set(Object.keys(packageJson.dependencies))

for (const { dependencies } of Object.values(variants)) {
  for (const dep of dependencies) commonDeps.delete(dep)
}
for (const { dependencies } of Object.values(variants)) {
  for (const dep of commonDeps) dependencies.add(dep)
}

module.exports = async function makeVariants() {
  for (const [name, { dependencies }] of Object.entries(variants)) {
    const out = path.resolve(__dirname, '..', name)
    const logWrite = (file) =>
      // eslint-disable-next-line no-console
      console.log(
        `${path.relative(
          process.cwd(),
          path.join(__dirname, file)
        )} -> ${path.relative(process.cwd(), path.join(out, file))}`
      )
    await fs.mkdirs(out)
    for (const entry of await fs.readdir(out)) {
      if (entry !== 'node_modules') await fs.remove(path.join(out, entry))
    }
    const packageJson = await fs.readJson(path.join(__dirname, 'package.json'))
    const oldName = packageJson.name
    const newName = packageJson.name.replace(/[^/]+$/, name)
    packageJson.name = newName
    packageJson.dependencies = Object.fromEntries(
      [...dependencies]
        .sort()
        .map((dep) => [dep, packageJson.dependencies[dep]])
    )
    await fs.writeJson(path.join(out, 'package.json'), packageJson, {
      spaces: 2,
    })
    logWrite('package.json')

    let readme = await fs.readFile(path.join(__dirname, 'README.md'), 'utf8')
    readme = readme
      .replace(new RegExp(oldName, 'g'), newName)
      .replace(
        new RegExp(encodeURIComponent(oldName), 'g'),
        encodeURIComponent(newName)
      )
    await fs.writeFile(path.join(out, 'README.md'), readme, 'utf8')
    logWrite('README.md')

    for (const file of [
      ...packageJson.files,
      '.gitignore',
      'LICENSE.md',
      'yarn.lock',
    ]) {
      const src = path.join(__dirname, file)
      const dest = path.join(out, file)
      await fs.copy(src, dest)
      logWrite(file)
    }
  }
}

if (require.main === module) module.exports()
