const getPlugins = require('@jcoreio/toolchain/util/getPlugins.cjs')
for (const plugin of getPlugins('configureMocha')) plugin()
