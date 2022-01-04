module.exports = {
  include: ['src/**', 'test/**'],
  extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'],
  reporter: ['lcov', 'text'],
  sourceMap: true,
  instrument: true,
}
