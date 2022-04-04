const getPlugins = require('./getPlugins.cjs')
for (const plugin of getPlugins('configureMocha')) plugin()
