/* eslint-env node */

module.exports = {
  include: ['lib/*.js'],
  require: [require.resolve('@babel/register')],
  sourceMap: false,
  instrument: false,
}
