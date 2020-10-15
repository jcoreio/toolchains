/* eslint-env node */
module.exports = function (api) {
  return require(`${process.env.npm_package_name}/babel.config.js`)(api)
}
