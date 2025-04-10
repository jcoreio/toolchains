#!/usr/bin/env node

const {
  packageJson,
  isMonorepoRoot,
  monorepoSubpackageJsons,
} = require('../util/findUps.cjs')
const execa = require('../util/execa.cjs')
const confirm = require('../util/confirm.cjs')
const semver = require('semver')
const writeMigratedVersion = require('../util/writeMigratedVersion.cjs')
const { name, version: currentVersion } = require('../package.json')

async function upgrade([version] = []) {
  const toolchains = [
    ...new Set(
      [packageJson, ...(isMonorepoRoot ? monorepoSubpackageJsons || [] : [])]
        .flatMap((p) => Object.keys(p.devDependencies || {}))
        .filter((pkg) => pkg.startsWith(`${name}-`))
    ),
  ]
  let migratedVersion = packageJson[name] && packageJson[name].migratedVersion
  if (!migratedVersion) {
    await writeMigratedVersion()
    migratedVersion = currentVersion
  }
  const isTest = Boolean(process.env.JCOREIO_TOOLCHAIN_SELF_TEST)

  if (!isTest && !version) {
    version = (
      await execa('npm', ['view', name, 'version'], {
        stdio: 'pipe',
      })
    ).stdout.trim()
    if (
      semver.major(version) > semver.major(migratedVersion) &&
      !(await confirm({
        message: 'Do you want to upgrade to a newer major version?',
        initial: true,
      }))
    ) {
      version = (
        await execa('npm', ['view', `${name}@^${migratedVersion}`, 'version'], {
          stdio: 'pipe',
        })
      ).stdout.trim()
    }
  }

  await execa(
    'pnpm',
    isTest ?
      [
        ...(isMonorepoRoot ? ['-r'] : []),
        'add',
        '-D',
        '--prefer-offline',
        '../packages/base',
        ...toolchains.map((t) => t.replace(`${name}-`, '../packages/')),
      ]
    : [
        ...(isMonorepoRoot ? ['-r'] : []),
        'update',
        '--prefer-offline',
        `${name}@^${version}`,
        ...toolchains.map((t) => `${t}@^${version}`),
      ]
  )
  if (isMonorepoRoot) await execa('pnpm', ['run', '-r', 'tc', 'migrate'])
  else await execa('tc', ['migrate'])
}

exports.description = 'upgrade toolchains and migrate'
exports.run = upgrade

if (require.main === module) {
  upgrade().then(
    () => process.exit(0),
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error.stack)
      process.exit(error.exitCode != null ? error.exitCode : 1)
    }
  )
}
