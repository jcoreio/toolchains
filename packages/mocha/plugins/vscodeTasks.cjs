const common = {
  type: 'shell',
  options: { shell: { executable: 'bash', args: ['-c', '-l'] } },
  command: 'pnpm',
  isBackground: false,
  group: 'test',
  presentation: {
    panel: 'dedicated',
    clear: true,
  },
}

module.exports = [
  () => [
    {
      ...common,
      label: 'test <file>',
      args: ['tc', 'test', '${file}'],
    },
    {
      ...common,
      label: 'test:watch <file>',
      args: ['tc', 'test', '--watch', '${file}'],
    },
    {
      ...common,
      label: 'test:debug <file>',
      args: ['tc', 'test', '-n', 'inspect-brk', '${file}'],
    },
  ],
]
