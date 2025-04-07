const {
  projectDir,
  packageJson: { name: pkg, private: _private },
  monorepoSubpackageJsonFiles,
  monorepoPackageJson,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const path = require('path')

let hasMain
try {
  hasMain =
    execa.sync('git', ['rev-parse', '--verify', 'main'], { stdio: 'pipe' })
      .exitCode === 0
  // eslint-disable-next-line no-unused-vars
} catch (error) {
  hasMain = false
}

const otherPackages =
  monorepoSubpackageJsonFiles ?
    monorepoSubpackageJsonFiles.map((f) => require(f).name)
  : []

const base = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    hasMain ? 'main' : 'master',
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
}

module.exports =
  (
    monorepoSubpackageJsonFiles &&
    monorepoPackageJson &&
    monorepoPackageJson.name !== '@jcoreio/toolchains'
  ) ?
    {
      ...base,
      // use separate git tags for each subpackage
      tagFormat: `${pkg}-v\${version}`,
      plugins: [
        [
          require.resolve('@semantic-release/commit-analyzer'),
          {
            preset: 'conventionalcommits',
            releaseRules: [
              // don't let commits scoped to other packages like fix(otherPackageName): ... trigger a release in this package
              ...otherPackages.flatMap((scope) => ({
                scope,
                release: false,
              })),
              ...[
                // make commits scoped to this package like fix(packageName): ... trigger a release in this package
                pkg,
                // make unscoped commits like fix: ... trigger a release in all packages
                undefined,
              ].flatMap((scope) => [
                { breaking: true, scope, release: 'major' },
                { revert: true, scope, release: 'patch' },
                { type: 'feat', scope, release: 'minor' },
                { type: 'fix', scope, release: 'patch' },
                { type: 'perf', scope, release: 'patch' },
              ]),
              // don't let any other types of commits trigger a release
              { scope: undefined, release: false },
            ],
          },
        ],
        [
          require.resolve('@semantic-release/release-notes-generator'),
          {
            preset: 'conventionalcommits',
            presetConfig: {
              types: [
                { type: 'build', section: 'Build System', hidden: true },
                { type: 'chore', section: 'Build System', hidden: true },
                {
                  type: 'ci',
                  section: 'Continuous Integration',
                  hidden: true,
                },
                { type: 'style', section: 'Styles', hidden: true },
                { type: 'test', section: 'Tests', hidden: true },
                ...[
                  { type: 'docs', section: 'Documentation' },
                  { type: 'feat', section: 'Features' },
                  { type: 'fix', section: 'Bug Fixes' },
                  { type: 'perf', section: 'Performance Improvements' },
                  { type: 'refactor', section: 'Code Refactoring' },
                ].flatMap((cfg) => [
                  // include commits scoped to this package like fix(packageName): ... in the release notes for this package
                  { ...cfg, scope: pkg, hidden: false },
                  // exclude commits scoped to other packages like fix(otherPackageName): ... from the release notes for this package
                  ...otherPackages.map((otherPkg) => ({
                    ...cfg,
                    scope: otherPkg,
                    hidden: true,
                  })),
                  // include unscoped commits like fix: ... in the release notes for all packages
                  { ...cfg, hidden: false },
                ]),
              ],
            },
          },
        ],
        ...(_private ?
          []
        : [
            [
              // this fork of @semantic-release/npm includes a patch that is necessary to fix an issue with monorepos
              // https://github.com/semantic-release/npm/pull/531
              require.resolve('@jcoreio/semantic-release-npm'),
              {
                pkgRoot: path.join(projectDir, 'dist'),
              },
            ],
          ]),
        require.resolve('@semantic-release/github'),
        ...getPluginsArraySync('semanticReleasePlugins'),
      ],
    }
  : {
      ...base,
      plugins: [
        require.resolve('@semantic-release/commit-analyzer'),
        require.resolve('@semantic-release/release-notes-generator'),
        ...(_private ?
          []
        : [
            [
              require.resolve('@jcoreio/semantic-release-npm'),
              {
                pkgRoot: path.join(projectDir, 'dist'),
              },
            ],
          ]),
        require.resolve('@semantic-release/github'),
        ...getPluginsArraySync('semanticReleasePlugins'),
      ],
    }
