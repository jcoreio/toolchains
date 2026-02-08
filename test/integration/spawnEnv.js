const env = { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '1' }
env.JCOREIO_TOOLCHAIN_CJS = ''
env.JCOREIO_TOOLCHAIN_MJS = ''
env.JCOREIO_TOOLCHAIN_COVERAGE = ''
env.JCOREIO_TOOLCHAIN_TEST = ''

module.exports = env
