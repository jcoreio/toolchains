const execa = require('execa')
const fs = require('fs-extra')

module.exports = async function runInit(dir) {
  const cwd = await fs.realpath(dir)
  await execa(
    process.execPath,
    [require.resolve('../../packages/base/scripts/toolchain.cjs'), 'init'],
    {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, JCOREIO_TOOLCHAIN_TEST: '1' },
    }
  )
}
