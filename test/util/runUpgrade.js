const execa = require('execa')
const fs = require('fs-extra')

module.exports = async function runUpgrade(dir, version) {
  const cwd = await fs.realpath(dir)
  await execa(
    process.execPath,
    [
      require.resolve('../../packages/base/scripts/toolchain.cjs'),
      'upgrade',
      ...(version ? [version] : []),
    ],
    {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, JCOREIO_TOOLCHAIN_TEST: '1' },
    }
  )
}
