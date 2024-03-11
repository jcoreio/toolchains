const getModules = require('../util/getModules.cjs')
const execa = require('../util/execa.cjs')
const path = require('path')

exports.run = async function smokeTestBuild() {
  const { cjs, esm } = await getModules('dist/package.json')

  function relpath(file) {
    const result = path.relative(process.cwd(), file)
    return result.startsWith('.') ? result : `./${result}`
  }

  for (const file of cjs) {
    await execa('node', ['-e', `require(${JSON.stringify(relpath(file))})`])
  }
  for (const file of esm) {
    await execa('node', [
      '--input-type',
      'module',
      '-e',
      `import(${JSON.stringify(relpath(file))})`,
    ])
  }
}

exports.description = 'smoke test that build output can be required/imported'
