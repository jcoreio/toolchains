module.exports = [
  async function buildDistPackageJson(packageJson) {
    delete packageJson.devDependencies
  },
]
