/* eslint-disable no-console */
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const {
  packageJson,
  isMonorepoRoot,
  monorepoSubpackageJsons,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const yaml = require('yaml')

/**
 * Fetches CircleCI data using the CircleCI API
 * @param {string} token CircleCI API token
 * @param {string} url API endpoint
 * @returns {Promise<Object>} API response
 */
async function fetchCircleCI(token, url) {
  const https = require('https')
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'circleci.com',
      port: 443,
      path: url,
      method: 'GET',
      headers: {
        'Circle-Token': token,
        Accept: 'application/json',
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(
            new Error(
              `CircleCI API ${url} error ${res.statusCode}: ${data || res.statusMessage}`
            )
          )
        } else {
          resolve(JSON.parse(data))
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}

/**
 * Gets the repository owner and name from git remote or package.json
 * @returns {Promise<{owner: string, repo: string}>}
 */
async function getRepoInfo() {
  let repoUrl = packageJson.repository?.url
  if (!repoUrl) {
    try {
      repoUrl = await execa('git', ['remote', 'get-url', 'origin'])
    } catch {
      throw new Error(
        'Could not determine repository URL. Please set it in package.json or git remote.'
      )
    }
  }

  // Extract owner/repo from various URL formats
  let match = repoUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/)
  if (!match) {
    throw new Error(`Could not parse repository URL: ${repoUrl}`)
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  }
}

/**
 * Extracts context names from CircleCI config
 * @returns {Promise<string[]>} Array of context names
 */
async function extractContextNames() {
  try {
    const configContent = await fs.readFile('.circleci/config.yml', 'utf8')
    const config = yaml.parse(configContent)

    const contextNames = new Set()

    // Extract contexts from workflows
    if (config.workflows) {
      for (const [, workflow] of Object.entries(config.workflows)) {
        if (workflow.jobs) {
          for (const job of workflow.jobs) {
            if (typeof job === 'object' && job !== null) {
              // job is {jobName: {context: [...], ...}} format
              for (const [, jobConfig] of Object.entries(job)) {
                if (jobConfig && jobConfig.context) {
                  const contexts =
                    Array.isArray(jobConfig.context) ?
                      jobConfig.context
                    : [jobConfig.context]
                  contexts.forEach((ctx) => contextNames.add(ctx))
                }
              }
            }
          }
        }
      }
    }

    return Array.from(contextNames)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('⚠ .circleci/config.yml not found')
      return []
    }
    err.message = `Failed to parse .circleci/config.yml: ${err.message}`
    throw err
  }
}

/**
 * Fetches context IDs by paginating through the CircleCI contexts API
 * @param {string} token CircleCI API token
 * @param {string} ownerSlug Owner Slug (e.g. github/jcoreio)
 * @param {string[]} contextNames Context names to look up
 * @returns {Promise<string[]>} Array of matching context IDs
 */
async function fetchContextIds(token, ownerSlug, contextNames) {
  if (contextNames.length === 0) {
    return []
  }

  const contextNameSet = new Set(contextNames)
  const contextIds = []
  let pageToken = null

  while (true) {
    const params = new URLSearchParams({
      'owner-slug': ownerSlug,
      'owner-type': 'organization',
    })
    if (pageToken) {
      params.append('page-token', pageToken)
    }

    const response = await fetchCircleCI(
      token,
      `/api/v2/context?${params.toString()}`
    )

    if (response.items) {
      for (const context of response.items) {
        if (contextNameSet.has(context.name)) {
          contextIds.push(context.id)
          contextNameSet.delete(context.name)
        }
      }
    }

    // Check if there are more pages
    if (!response.next_page_token) {
      break
    }
    pageToken = response.next_page_token
  }

  if (contextNameSet.size > 0) {
    const missing = Array.from(contextNameSet).join(', ')
    console.log(
      `⚠ Could not find context IDs for: ${missing} (they may not exist yet)`
    )
  }

  return contextIds
}

module.exports = async function npmTrustCircle(args = []) {
  const dryRun = args.includes('--dry-run')
  const circleToken =
    args.filter((a) => !a.startsWith('-'))[0] || process.env.CIRCLE_TOKEN
  if (!circleToken) {
    throw new Error(
      'CircleCI token required. Pass as first argument or set CIRCLE_TOKEN environment variable.'
    )
  }

  const { owner, repo } = await getRepoInfo()

  console.log(`Fetching CircleCI data for ${owner}/${repo}...`)

  // Get organization ID
  const orgResponse = await fetchCircleCI(circleToken, `/api/v2/me`)
  const orgId = orgResponse.id
  console.log(`✓ Organization ID: ${orgId}`)

  // Get project ID
  const projectResponse = await fetchCircleCI(
    circleToken,
    `/api/v2/project/github/${owner}/${repo}`
  )
  const projectId = projectResponse.id
  console.log(`✓ Project ID: ${projectId}`)

  // Get the most recent pipeline
  const pipelinesResponse = await fetchCircleCI(
    circleToken,
    `/api/v2/projects/${projectId}/pipeline-definitions`
  )

  if (!pipelinesResponse.items || pipelinesResponse.items.length === 0) {
    throw new Error(
      'No pipelines found. Ensure you have at least one pipeline run.'
    )
  }

  const pipelineDefinitionId = pipelinesResponse.items[0].id
  console.log(`✓ Pipeline ID: ${pipelineDefinitionId}`)

  // Extract contexts from .circleci/config.yml
  console.log('\nExtracting contexts from .circleci/config.yml...')
  const contextNames = await extractContextNames()

  if (contextNames.length > 0) {
    console.log(
      `✓ Found ${contextNames.length} context(s): ${contextNames.join(', ')}`
    )
  } else {
    console.log('⚠ No contexts found in .circleci/config.yml')
  }

  // Look up context IDs using paginated API
  let contextIds = []
  if (contextNames.length > 0) {
    console.log('\nFetching context IDs from CircleCI API...')
    contextIds = await fetchContextIds(
      circleToken,
      `github/${owner}`,
      contextNames
    )
    if (contextIds.length > 0) {
      console.log(`✓ Found ${contextIds.length} context ID(s)`)
    }
  }

  const packageNames =
    isMonorepoRoot ?
      monorepoSubpackageJsons.map((p) => p.name)
    : [packageJson.name]

  for (const packageName of packageNames) {
    // Now run npm trust with the collected information
    const npmTrustArgs = [
      'trust',
      'circleci',
      packageName,
      '--org-id',
      orgId,
      '--project-id',
      projectId,
      '--pipeline-definition-id',
      pipelineDefinitionId,
      '--vcs-origin',
      `github/${owner}/${repo}`,
      ...contextIds.flatMap((contextId) => ['--context-id', contextId]),
      ...(dryRun ? ['--dry-run'] : []),
    ]

    console.log(`\nExecuting: npm ${npmTrustArgs.join(' ')}`)
    await execa('npm', npmTrustArgs, { stdio: 'inherit' })
  }
}
