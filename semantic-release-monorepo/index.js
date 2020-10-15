const readPkg = require('read-pkg')
const withOnlyPackageCommits = require('./only-package-commits')
const versionToGitTag = require('./version-to-git-tag')
const logPluginVersion = require('./log-plugin-version')
const { wrapStep } = require('semantic-release-plugin-decorators')
const { name: packageName } = require('../package.json')

const {
  mapNextReleaseVersion,
  withOptionsTransform,
} = require('./options-transforms')

const compose = (...fns) => fns.reduce((a, b) => (...args) => a(b(...args)))

const wrapperName = `${packageName}-semrel`

const analyzeCommits = wrapStep(
  'analyzeCommits',
  compose(logPluginVersion('analyzeCommits'), withOnlyPackageCommits),
  { wrapperName }
)

const generateNotes = wrapStep(
  'generateNotes',
  compose(
    logPluginVersion('generateNotes'),
    withOnlyPackageCommits,
    withOptionsTransform(mapNextReleaseVersion(versionToGitTag))
  ),
  { wrapperName }
)

const success = wrapStep(
  'success',
  compose(
    logPluginVersion('success'),
    withOnlyPackageCommits,
    withOptionsTransform(mapNextReleaseVersion(versionToGitTag))
  ),
  { wrapperName }
)

const fail = wrapStep(
  'fail',
  compose(
    logPluginVersion('fail'),
    withOnlyPackageCommits,
    withOptionsTransform(mapNextReleaseVersion(versionToGitTag))
  ),
  { wrapperName }
)

module.exports = {
  analyzeCommits,
  generateNotes,
  success,
  fail,
  tagFormat: readPkg.sync().name + '-v${version}',
}
