const path = require('path')
const execa = require('../util/execa.cjs')
const ChdirFs = require('../util/ChdirFs.cjs')
const pkg = require('../package.json')
const dedent = require('dedent-js')
const parseRepositoryUrl = require('../util/parseRepositoryUrl.cjs')
const markdownBadges = require('../util/markdownBadges.cjs')

async function create(args = []) {
  const prompt = require('../util/prompt.cjs')

  let monorepoPackageJson, monorepoProjectDir
  try {
    ;({
      monorepoPackageJson,
      monorepoProjectDir,
    } = require('../util/findUps.cjs'))
  } catch (error) {
    if (!error.message.startsWith('failed to find project package.json')) {
      throw error
    }
  }

  const required = (s) => Boolean(s) || 'required'

  let defaultAuthor
  if (monorepoPackageJson) defaultAuthor = monorepoPackageJson.author
  else {
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
      format: (text) => (text || '').split(/\s*,\s*|\s+/g),
    },
    ...(monorepoPackageJson
      ? []
      : [
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
        ]),
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
  } = answers

  const { organization, repo } = monorepoPackageJson
    ? parseRepositoryUrl(monorepoPackageJson.repository.url)
    : answers

  const cwd = path.resolve(directory)

  await require('fs-extra').mkdirs(path.join(cwd, 'src'))

  const fs = ChdirFs(cwd)

  const subpackagePath = monorepoProjectDir
    ? path.relative(monorepoProjectDir, cwd)
    : undefined

  const branch = subpackagePath
    ? (
        await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
          stdio: 'pipe',
          encoding: 'utf8',
          maxBuffer: 1024,
        })
      ).stdout.trim()
    : ''

  const packageJson = {
    name,
    description,
    repository: {
      type: 'git',
      url: `https://github.com/${organization}/${repo}.git`,
      ...(subpackagePath ? { directory: subpackagePath } : {}),
    },
    homepage: `https://github.com/${organization}/${repo}${
      subpackagePath ? `/tree/${branch}/${subpackagePath}` : ''
    }`,
    bugs: {
      url: `https://github.com/${organization}/${repo}/issues`,
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

      ${markdownBadges({ name, organization, repo })}
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

  if (!monorepoPackageJson) {
    await execa('git', ['init'], { cwd })
    await execa(
      'git',
      ['remote', 'add', 'origin', packageJson.repository.url],
      {
        cwd,
      }
    )
  }

  const isTest = Boolean(process.env.JCOREIO_TOOLCHAIN_SELF_TEST)

  await execa(
    'pnpm',
    [
      'add',
      '-D',
      '--prefer-offline',
      `${pkg.name}@${isTest ? 'workspace:*' : pkg.version}`,
    ],
    { cwd }
  )
  await execa('pnpm', ['exec', 'tc', 'init'], { cwd })

  if (!monorepoPackageJson) {
    await execa('git', ['add', '.'], { cwd })
    await execa(
      'git',
      ['commit', '-m', 'chore: initial commit from tc create'],
      {
        cwd,
      }
    )
  }
}

exports.description = 'create a new toolchain project'
exports.run = create

const licenses = {
  MIT: {
    title: 'The MIT License',
  },
}
