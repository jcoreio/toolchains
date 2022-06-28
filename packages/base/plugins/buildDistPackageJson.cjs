module.exports = [
  async function buildDistPackageJson(packageJson) {
    delete packageJson.devDependencies
    delete packageJson.scripts
    delete packageJson.config
  },
]
