const commonPlugins = [
  'asyncGenerators',
  'bigInt',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'classStaticBlock',
  'functionSent',
  'logicalAssignment',
  'moduleStringNames',
  'nullishCoalescingOperator',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'optionalChaining',
  'privateIn',
]

const modulePlugins = [
  'dynamicImport',
  'exportNamespaceFrom',
  'exportDefaultFrom',
  'importMeta',
  'topLevelAwait',
]

const babelParseOpts = {
  js: {
    sourceType: 'unambiguous',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    startLine: 1,
    plugins: [
      ...commonPlugins,
      ...modulePlugins,
      ['flow', { all: true }],
      'flowComments',
      'jsx',
    ],
  },
  jsx: {
    sourceType: 'unambiguous',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    startLine: 1,
    plugins: [
      ...commonPlugins,
      ...modulePlugins,
      ['flow', { all: true }],
      'flowComments',
      'jsx',
    ],
  },
  cjs: {
    sourceType: 'commonjs',
    startLine: 1,
  },
  mjs: {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    startLine: 1,
    plugins: [...commonPlugins, ...modulePlugins],
  },
  ts: {
    sourceType: 'unambiguous',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    startLine: 1,
    plugins: [
      ...commonPlugins,
      ...modulePlugins,
      'typescript',
      'decorators-legacy',
    ],
  },
  'd.ts': {
    sourceType: 'unambiguous',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    startLine: 1,
    plugins: [
      ...commonPlugins,
      ...modulePlugins,
      ['typescript', { dts: true }],
      'decorators-legacy',
    ],
  },
  tsx: {
    sourceType: 'unambiguous',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    startLine: 1,
    plugins: [
      ...commonPlugins,
      ...modulePlugins,
      'jsx',
      'typescript',
      'decorators-legacy',
    ],
  },
  cts: {
    sourceType: 'commonjs',
    startLine: 1,
    plugins: [...commonPlugins, 'typescript', 'decorators-legacy'],
  },
  'd.cts': {
    sourceType: 'commonjs',
    startLine: 1,
    plugins: [
      ...commonPlugins,
      ['typescript', { dts: true }],
      'decorators-legacy',
    ],
  },
  mts: {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    startLine: 1,
    plugins: [
      ...commonPlugins,
      ...modulePlugins,
      'typescript',
      'decorators-legacy',
    ],
  },
  'd.mts': {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    startLine: 1,
    plugins: [
      ...commonPlugins,
      ...modulePlugins,
      ['typescript', { dts: true }],
      'decorators-legacy',
    ],
  },
}

function getBabelParseOpts(file) {
  const match = /\.(js|cjs|mjs|jsx|tsx|(d\.)?(ts|cts|mts))$/i.exec(file)
  const ext = (match ? match[1] : undefined) || 'js'
  return babelParseOpts[ext]
}

module.exports = getBabelParseOpts
