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

## Current limitations

### ESM output

`@jcoreio/toolchain-esnext` builds dual CJS+ESM packages, but doesn't handle
certain cases yet. For example imports from lodash may not work in the transpiled
ESM right now.

### Export maps

Right now `@jcoreio/toolchain-esnext` adds all files to the export map. I may
want to change this to wildcard entries and/or support limiting what gets
exported in the future.

### Source maps

Right now the build doesn't output source maps or source files in
the published package, but we should probably make it do that.