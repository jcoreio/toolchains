const dedent = require('dedent-js')

module.exports = function markdownBadges({ name, organization, repo }) {
  return dedent`
    [![CircleCI](https://circleci.com/gh/${organization}/${repo}.svg?style=svg)](https://circleci.com/gh/${organization}/${repo})
    [![Coverage Status](https://codecov.io/gh/${organization}/${repo}/branch/master/graph/badge.svg)](https://codecov.io/gh/${organization}/${repo})
    [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
    [![npm version](https://badge.fury.io/js/${encodeURIComponent(
      name
    )}.svg)](https://badge.fury.io/js/${encodeURIComponent(name)})
  `
}
