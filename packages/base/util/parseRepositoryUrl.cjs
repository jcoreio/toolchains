const { parse: parseUrl } = require('url')

const repoRegExp = new RegExp('^/(.+?)/([^/.]+)')

module.exports = function parseRepositoryUrl(url) {
  const parsed = parseUrl(url)
  const match = repoRegExp.exec(parsed.path || '')
  if (!match) throw new Error(`unsupported source repository url: ${url}`)
  const [organization, repo] = match.slice(1)
  return { ...parsed, organization, repo }
}
