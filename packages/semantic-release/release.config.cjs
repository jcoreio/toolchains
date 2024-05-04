const {
  projectDir,
  packageJson: { name: pkg },
  monorepoSubpackageJsonFiles,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const path = require('path')

let hasMain
try {
  hasMain =
    execa.sync('git', ['rev-parse', '--verify', 'main'], { stdio: 'pipe' })
      .exitCode === 0
} catch (error) {
  hasMain = false
}

const otherPackages = monorepoSubpackageJsonFiles
  ? monorepoSubpackageJsonFiles.map((f) => require(f).name)
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

module.exports = monorepoSubpackageJsonFiles
  ? {
      ...base,
      tagFormat: `${pkg}-v\${version}`,
      plugins: [
        [
          require.resolve('@semantic-release/commit-analyzer'),
          {
            preset: 'conventionalcommits',
            releaseRules: [
              ...[pkg, undefined].flatMap((scope) => [
                { breaking: true, scope, release: 'major' },
                { revert: true, scope, release: 'patch' },
                { type: 'feat', scope, release: 'minor' },
                { type: 'fix', scope, release: 'patch' },
                { type: 'perf', scope, release: 'patch' },
              ]),
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
                { type: 'ci', section: 'Continuous Integration', hidden: true },
                { type: 'style', section: 'Styles', hidden: true },
                { type: 'test', section: 'Tests', hidden: true },
                ...[
                  { type: 'docs', section: 'Documentation' },
                  { type: 'feat', section: 'Features' },
                  { type: 'fix', section: 'Bug Fixes' },
                  { type: 'perf', section: 'Performance Improvements' },
                  { type: 'refactor', section: 'Code Refactoring' },
                ].flatMap((cfg) => [
                  { ...cfg, scope: pkg, hidden: false },
                  ...otherPackages.map((otherPkg) => ({
                    ...cfg,
                    scope: otherPkg,
                    hidden: true,
                  })),
                  { ...cfg, hidden: false },
                ]),
              ],
            },
          },
        ],
        [
          require.resolve('@semantic-release/npm'),
          {
            pkgRoot: path.join(__dirname, 'dist'),
          },
        ],
        require.resolve('@semantic-release/github'),
      ],
    }
  : {
      ...base,
      plugins: [
        require.resolve('@semantic-release/commit-analyzer'),
        require.resolve('@semantic-release/release-notes-generator'),
        [
          require.resolve('@semantic-release/npm'),
          {
            pkgRoot: path.join(projectDir, 'dist'),
          },
        ],
        require.resolve('@semantic-release/github'),
      ],
    }
