module.exports = [
  async function getConfigFiles() {
    return {
      'tsconfig.json': JSON.stringify(
        {
          extends: './node_modules/@jcoreio/toolchain-typescript/tsconfig.json',
          include: ['./src'],
          exclude: ['node_modules'],
        },
        null,
        2
      ),
      'tsconfig.build.json': JSON.stringify(
        {
          extends: './tsconfig.json',
          include: ['./src'],
          exclude: ['node_modules', './src/**/*.spec.ts', './test'],
          compilerOptions: {
            outDir: './dist',
            declaration: true,
            noEmit: false,
            emitDeclarationOnly: true,
          },
        },
        null,
        2
      ),
    }
  },
]
