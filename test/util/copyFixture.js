const fs = require('fs-extra')
const Path = require('path')
const fixtures = Path.resolve(__dirname, '..', '..', 'fixtures')

async function copyFixture(name) {
  const src = Path.join(fixtures, name, 'input')
  const dest = Path.join(fixtures, name, 'actual')
  await fs.remove(dest)
  await fs.copy(src, dest)
  return dest
}

module.exports = copyFixture
