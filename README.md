# @jcoreio/toolchain

A system for managing JS/TS project dev tools

## Project goals

- Make it easier to keep standalone project dev dependencies and configuration
  up-to-date with the ecosystem
- Help us migrate all of our packages to ESM
- Make it easier to migrate a project to different systems (e.g. switching to
  typescript, or possibly in the future switching from mocha to another test
  runner, or from CircleCI to GitHub actions)
- Make it easier to set up new standalone projects with good dev tools and
  config

## Migrating an existing project to `@jcoreio/toolchain`

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

## Installing `@jcoreio/toolchain` in an empty project

I plan to make `tc init` work better for this use case, but right now the
process is:

- Manually install the relevant `@jcoreio/toolchain*` packages
- Run `tc bootstrap`
- Run `pnpm install` to install new versions set by `tc bootstrap`
- Run `tc format`
- Run `tc lint:fix`

## Upgrading `@jcoreio/toolchain`

I plan to create a `tc upgrade` command, but right now the process is:

- Upgrade `@jcoreio/toolchain*` to the new version
- Run `tc bootstrap`
- Run `pnpm install` to install new versions set by `tc bootstrap`
- Run `tc format`
- Run `tc lint:fix`
