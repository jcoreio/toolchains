const { monorepoPackageJson, packageJson } = require('../util/findUps.cjs')
const parseRepositoryUrl = require('../util/parseRepositoryUrl.cjs')
const getMarkdownBadges = require('../util/markdownBadges.cjs')

exports.run = async function badges(args = []) {
  const { name, repository } = monorepoPackageJson || packageJson
  const { organization, repo } = parseRepositoryUrl(repository.url)
  // eslint-disable-next-line no-console
  console.log(getMarkdownBadges({ name, organization, repo }))
}
exports.description = 'print markdown badges for readme'
