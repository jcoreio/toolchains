module.exports = [
  () => [
    {
      name: 'test:debug <file>',
      port: 9229,
      request: 'attach',
      skipFiles: ['<node_internals>/**'],
      type: 'node',
      preLaunchTask: 'test:debug <file>',
    },
  ],
]
