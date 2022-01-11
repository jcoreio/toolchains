const fs = require('fs-extra')
const Path = require('path')
const execa = require('execa')
const fixtures = Path.resolve(__dirname, '..', '..', 'fixtures')
const toolchains = {
  base: require('../../packages/base/package.json').name,
}

async function copyFixture(name) {
  const src = Path.join(fixtures, name, 'input')
  const dest = Path.join(fixtures, name, 'actual')
  await fs.remove(dest)
  await fs.copy(src, dest)
  await execa('pnpm', ['add', '-D', `${toolchains.base}@workspace:*`], {
    cwd: dest,
    stdio: 'inherit',
  })
  return dest
}

module.exports = copyFixture
