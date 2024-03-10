# @jcoreio/toolchain

A system for managing JS/TS project dev tools

## Project goals

- Make it easy to keep standalone project dev dependencies and configuration
  up-to-date with the ecosystem
- Help us migrate all of our packages to ESM
- Make it easy to migrate a project to different systems (e.g. switching to
  typescript, or possibly in the future switching from mocha to another test
  runner, or from CircleCI to GitHub actions)
- Make it easy to set up new standalone projects with all the dev tools and
  config we use to ensure quality and publish packages

## How-to

### Migrating an existing project to `@jcoreio/toolchain`

In your project dir, run:

```sh
pnpm --package=@jcoreio/toolchain@<version> dlx tc init
```

This does a bunch of things:

- Switches the project from `yarn` or `npm` to `pnpm`
- Installs the applicable `@jcore/toolchain` packages
- Updates managed dev dependencies
- Adds config files for managed dev tools to the project
- Removes obsolete dev dependencies, config files, and things in package.json
  that have been common in projects before `@jcoreio/toolchain`
- Formats files and autofixes eslint errors

### Installing `@jcoreio/toolchain` in an empty project

I plan to make `tc init` work better for this use case, but right now the
process is:

- Manually install the relevant `@jcoreio/toolchain*` packages
- Run `tc migrate`

### Upgrading `@jcoreio/toolchain`

- Run `tc upgrade [version]`

### Specify `main`, `module`, `exports`, and `bin` and link package locally

Since the build output is in the `dist` directory, you should have relative paths
to `./dist` in your `package.json`:

```json
{
  "main": "./dist/index.js",
  "bin": "./dist/index.js"
```

That way, if you link your package root to another project locally, requiring/running
it will work.

`tc build` strips the `./dist/` out of these paths in the output `dist/package.json`
that actually gets published:

```json
{
  "main": "./index.js",
  "bin": "./index.js"
```

### Run build scripts

`@jcoreio/toolchain` adds a `toolchain` script to your `package.json` (also `tc`
for short):

```
$ pnpm toolchain

Usage: toolchain <command> <arguments...>

Available commands:
  build               build dist directory
  check               check format, types (if applicable), and lint
  ci:browse           open CircleCI page in browser
  clean               remove build output
  coverage            run tests with code coverage
  format              format files with prettier
  init                install toolchains and migrate
  install-git-hooks   install git hooks
  lint                check files with eslint
  lint:fix            autofix eslint errors
  migrate             update dependencies and config, fix lint errors and format
  open:coverage       open code coverage report
  preinstall          run this script before installing toolchains in a project
  prepublish          run check, coverage, and build
  release             run automated release
  test                run tests
  upgrade             upgrade toolchains and migrate
  version             print version of @jcoreio/toolchain
```

### Customize Git hooks

Edit `githooks.cjs`. The default added by `toolchain init` is:

```js
/* eslint-env node, es2018 */
module.exports = {
  ...require('@jcoreio/toolchain/githooks.cjs'),
}
```

If you jump to `@jcoreio/toolchain/githooks.cjs`, you'll see:

```js
module.exports = {
  'pre-commit': 'lint-staged',
}
```

Each hook can be a shell command string or a (possibly async) function.

`toolchain init`/`toolchain install-git-hooks` essentially does
`git config core.hooksPath node_modules/@jcoreio/toolchain/githooks`,
which contains the scripts that invoke what's configured in your `githooks.cjs`.

### Disable ESM build

Set `outputEsm: false` in `toolchain.config.cjs`:

```js
/* eslint-env node, es2018 */
module.exports = {
  cjsBabelEnv: { forceAllTransforms: true },
  outputEsm: false,
}
```

### Configure transpilation options

You can put options for `@babel/preset-env` in `cjsBabelEnv`/`esmBabelEnv` in `toolchain.config.cjs`. The default options are:

```js
/* eslint-env node, es2018 */
module.exports = {
  cjsBabelEnv: { forceAllTransforms: true },
  esmBabelEnv: { targets: { node: 16 } },
}
```

### Run scripts before or after toolchain scripts

Similar to `package.json` scripts, you can add `pre*` and `post*` scripts to your
`toolchain.config.cjs`. However, the script can be a shell command string or an
object with props `{ description: string, run: () => any }`:

```js
/* eslint-env node, es2018 */
module.exports = {
  cjsBabelEnv: { forceAllTransforms: true },
  esmBabelEnv: { targets: { node: 16 } },
  scripts: {
    pretest: 'echo test',
    postbuild: {
      description: 'runs after build',
      run: async () => {
        // do something...
      },
    },
  },
}
```

### Load chai plugins, customize mocha, etc.

Edit `.mocharc.cjs`. For example to add your own configuration script that loads chai plugins:

```js
/* eslint-env node, es2018 */
const base = require('@jcoreio/toolchain-mocha/.mocharc.cjs')
module.exports = {
  ...base,
  require: [...base.require, 'test/configure.js'],
}
```

### Change mocha default specs

Edit `.mocharc.cjs`. It's recommended to use the `getSpecs` helper to avoid running
all specs by default if specific specs are passed on the command line. It's kind of
a bug that the Mocha CLI doesn't override the specs from config by default...

```js
/* eslint-env node, es2018 */
const base = require('@jcoreio/toolchain-mocha/.mocharc.cjs')
const { getSpecs } = require('@jcoreio/toolchain-mocha')
module.exports = {
  ...base,
  spec: getSpecs(['src/**/*.spec.js']),
}
```

### Define multiple test targets

If you define `test:unit`, `test:integration` etc scripts, `@jcoreio/toolchain-mocha`
will automatically create `coverage:*` scripts for them, and reconfigure the `test`
script to run the `test:*` scripts in sequence.

To be precise, it looks for scripts matching `/^test\W/`, so the names `test-unit` and
`test/foo` etc. would also work.

Example `toolchain.config.cjs`:

```js
/* eslint-env node, es2018 */
const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = {
  scripts: {
    'test:unit': {
      description: 'run unit tests',
      run: (args = []) =>
        execa('mocha', ['--config', '.mocharc-unit.cjs', ...args]),
    },
    'pretest:integration': 'docker compose up -d',
    'test:integration': {
      description: 'run integration tests',
      run: (args = []) =>
        execa('mocha', ['--config', '.mocharc-integration.cjs', ...args]),
    },
  },
}
```

### Create dual CJS+ESM packages

As long as you use `@jcoreio/toolchain-esnext` and don't have `outputEsm: false` in
your `toolchain.config.cjs`, `tc build` will output both `.cjs` and `.mjs` files.

There will be a `tc test:esm` command available that runs all your tests in ESM mode
so you can make sure the ESM works.

Although ESM requires explicit file extensions for relative imports, you should still
omit them from your source and test code so that the build and test scripts work for
both CJS and ESM. The toolchain will use a babel plugin to add the necessary extensions
to your import paths when building and testing.

## Current limitations

### Source maps

Right now the build doesn't output source maps or source files in
the published package, but we should probably make it do that.
