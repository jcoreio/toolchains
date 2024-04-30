const path = require('path')
const execa = require('../util/execa.cjs')
const ChdirFs = require('../util/ChdirFs.cjs')
const pkgName = require('../package.json').name
const dedent = require('dedent-js')

async function create(args = []) {
  const prompt = require('prompts')

  const required = (s) => Boolean(s) || 'required'

  let defaultAuthor
  try {
    defaultAuthor = (
      await execa('git', ['config', 'user.name'], {
        stdio: 'pipe',
        maxBuffer: 1024,
        encoding: 'utf8',
      })
    ).stdout.trim()
  } catch (error) {
    // ignore
  }

  const questions = [
    {
      type: 'text',
      name: 'directory',
      message: 'Destination directory:',
      validate: required,
    },
    {
      type: 'text',
      name: 'name',
      message: 'Package name:',
      initial: (prev, { directory }) => path.basename(directory),
      validate: required,
    },
    {
      type: 'text',
      name: 'description',
      message: 'Package description:',
      validate: required,
    },
    {
      type: 'text',
      name: 'author',
      initial: defaultAuthor,
      message: 'Package author:',
      validate: required,
    },
    {
      type: 'text',
      name: 'keywords',
      message: 'Package keywords:',
      format: (text) => text.split(/\s*,\s*|\s+/g),
    },
    {
      type: 'text',
      name: 'organization',
      initial: (prev, { name }) => {
        const match = /^@(.*?)\//.exec(name)
        if (match) return match[1]
      },
      message: 'GitHub organization:',
      validate: required,
    },
    {
      type: 'text',
      name: 'repo',
      message: 'GitHub repo:',
      initial: (prev, { name }) => name.replace(/^@(.*?)\//, ''),
      validate: required,
    },
    {
      type: 'select',
      name: 'license',
      message: 'License',
      choices: Object.entries(licenses).map(([value, { title }]) => ({
        title,
        value,
      })),
    },
    {
      type: 'text',
      name: 'copyrightHolder',
      message: 'Copyright holder:',
      initial: (prev, { author }) => author,
      validate: required,
    },
    {
      name: 'ready',
      type: 'confirm',
      initial: true,
      message: 'Ready to go?',
    },
  ]

  let answers
  do {
    answers = await prompt(questions)
    for (const question of questions) {
      const { name, transformer } = question
      if (name !== 'ready') {
        const answer = answers[name]
        question.initial = transformer ? transformer(answer) : answer
      }
    }
  } while (!answers.ready)

  const {
    directory,
    name,
    description,
    author,
    keywords,
    license,
    copyrightHolder,
    organization,
    repo,
  } = answers

  const cwd = path.resolve(directory)

  await require('fs-extra').mkdirs(path.join(cwd, 'src'))

  const fs = ChdirFs(cwd)

  const packageJson = {
    name,
    description,
    repository: {
      type: 'git',
      url: `https://github.com/${organization}/${repo}.git`,
    },
    homepage: `https://github.com/${organization}/${repo}`,
    bugs: {
      url: `https://github.com/${organization}/${repo}`,
    },
    author,
    license,
    keywords,
  }

  await fs.writeJson('package.json', packageJson, { spaces: 2 })

  const files = {
    'README.md': dedent`
      # ${name}

      ${description}

      [![CircleCI](https://circleci.com/gh/${organization}/${repo}.svg?style=svg)](https://circleci.com/gh/${organization}/${repo})
      [![Coverage Status](https://codecov.io/gh/${organization}/${repo}/branch/master/graph/badge.svg)](https://codecov.io/gh/${organization}/${repo})
      [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
      [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
      [![npm version](https://badge.fury.io/js/${encodeURIComponent(
        name
      )}.svg)](https://badge.fury.io/js/${encodeURIComponent(name)}) 
    `,
    'LICENSE.md': (
      await fs.readFile(require.resolve(`./licenses/${license}.md`), 'utf8')
    )
      .replace(/<YEAR>/g, String(new Date().getFullYear()))
      .replace(/<COPYRIGHT HOLDER>/g, copyrightHolder),
  }
  await Promise.all(
    Object.entries(files).map(async ([name, content]) => {
      const file = path.resolve(cwd, name)
      await fs.writeFile(file, content, 'utf8')
      // eslint-disable-next-line no-console
      console.error(`wrote ${path.relative(process.cwd(), file)}`)
    })
  )

  await execa('git', ['init'], { cwd })
  await execa('git', ['remote', 'add', 'origin', packageJson.repository.url], {
    cwd,
  })
  await execa(
    'pnpm',
    ['add', '-D', '--prefer-offline', '--no-optional', pkgName],
    { cwd }
  )
  await execa('pnpm', ['exec', 'tc', 'init'], { cwd })

  await execa('git', ['add', '.'], { cwd })
  await execa('git', ['commit', '-m', 'chore: initial commit from tc create'], {
    cwd,
  })
}

exports.description = 'create a new toolchain project'
exports.run = create

const licenses = {
  MIT: {
    title: 'The MIT License',
  },
}
