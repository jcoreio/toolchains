const execa = require('../util/execa.cjs')
const {
  packageJson,
  isMonorepoRoot,
  toolchainManaged,
} = require('../util/findUps.cjs')

async function installOptionalDeps() {
  const choices = new Set()
  const { dependencies = {}, devDependencies = {} } = packageJson
  for (const dep of Object.keys({
    ...toolchainManaged.optionalDependencies,
    ...toolchainManaged.optionalDevDependencies,
  })) {
    if (!dependencies[dep] && !devDependencies[dep]) {
      choices.add(dep)
    }
  }
  if (!choices.size) {
    // eslint-disable-next-line no-console
    console.error('There are no additional optional dependencies to install')
    process.exit(0)
  }
  const finalChoices = [...choices].sort()
  const { selected } = await require('../util/prompt.cjs')({
    name: 'selected',
    type: 'multiselect',
    message: 'Select optional dependencies to install',
    choices: finalChoices,
  })
  const selectedSet = new Set(selected.map((i) => finalChoices[i]))

  const selectedDeps = Object.keys(
    toolchainManaged.optionalDependencies || {}
  ).filter((dep) => selectedSet.has(dep))
  const selectedDevDeps = Object.keys(
    toolchainManaged.optionalDevDependencies || {}
  ).filter((dep) => selectedSet.has(dep))

  if (selectedDeps.length) {
    await execa('pnpm', [
      'add',
      '--prefer-offline',
      ...(isMonorepoRoot ? ['-w'] : []),
      ...selectedDeps.map(
        (dep) => `${dep}@${toolchainManaged.optionalDependencies[dep]}`
      ),
    ])
  }
  if (selectedDevDeps.length) {
    await execa('pnpm', [
      'add',
      '-D',
      '--prefer-offline',
      ...(isMonorepoRoot ? ['-w'] : []),
      ...selectedDevDeps.map(
        (dep) => `${dep}@${toolchainManaged.optionalDevDependencies[dep]}`
      ),
    ])
  }
}

exports.description =
  'select and install optional toolchain-managed dependencies'

exports.run = installOptionalDeps
