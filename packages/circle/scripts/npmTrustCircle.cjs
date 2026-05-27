/* eslint-disable no-console */
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const {
  packageJson,
  isMonorepoRoot,
  monorepoSubpackageJsons,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const yaml = require('yaml')
const { inspect } = require('util')

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

    if (!config.workflows || typeof config.workflows !== 'object') return []

    const contextNames = new Set()

    for (const workflow of Object.values(config.workflows)) {
      for (const job of workflow.jobs || []) {
        if (!job || typeof job !== 'object') continue
        for (const jobConfig of Object.values(job)) {
          if (!jobConfig || !jobConfig.context) continue
          for (const context of Array.isArray(jobConfig.context) ?
            jobConfig.context
          : [jobConfig.context]) {
            contextNames.add(context)
          }
        }
      }
    }

    return Array.from(contextNames)
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error('.circleci/config.yml not found')
    }
    err.message = `Failed to parse .circleci/config.yml: ${err.message}`
    throw err
  }
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

  /**
   * Fetches CircleCI data using the CircleCI API
   * @param {string} url API endpoint
   * @param {object} params search params
   * @returns {Promise<Object>} API response
   */
  async function fetchCircleCI(url, params) {
    url = `https://circleci.com/${url.replace(/^\//, '')}`
    if (params) url = `${url}?${new URLSearchParams(params).toString()}`
    const res = await fetch(url, {
      headers: {
        'Circle-Token': circleToken,
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => undefined)
      throw new Error(
        `CircleCI API ${url} error ${res.status}: ${body ? inspect(body, { depth: 5 }) : '(failed to get json response body)'}`
      )
    }
    return await res.json()
  }

  /**
   * Fetches context IDs by paginating through the CircleCI contexts API
   * @param {string} ownerSlug Owner Slug (e.g. github/jcoreio)
   * @param {string[]} contextNames Context names to look up
   * @returns {Promise<string[]>} Array of matching context IDs
   */
  async function fetchContextIds(ownerSlug, contextNames) {
    if (contextNames.length === 0) {
      return []
    }

    const contextNameSet = new Set(contextNames)
    const contextIds = []
    let pageToken = null

    do {
      const response = await fetchCircleCI(`/api/v2/context`, {
        'owner-slug': ownerSlug,
        'owner-type': 'organization',
        ...(pageToken && { 'page-token': pageToken }),
      })

      if (response.items) {
        for (const context of response.items) {
          if (contextNameSet.has(context.name)) {
            contextIds.push(context.id)
            contextNameSet.delete(context.name)
          }
        }
      }

      pageToken = response.next_page_token
    } while (pageToken)

    if (contextNameSet.size > 0) {
      const missing = Array.from(contextNameSet).join(', ')
      console.log(`⚠ Could not find context IDs for: ${missing}`)
    }

    return contextIds
  }

  const { owner, repo } = await getRepoInfo()

  console.log(`Fetching CircleCI data for ${owner}/${repo}...`)
  const orgSlug = `github/${owner}`

  // Get organization ID
  const orgResponse = await fetchCircleCI(`/api/v2/organization/${orgSlug}`)
  const orgId = orgResponse.id
  console.log(`✓ Organization ID: ${orgId}`)

  // Get project ID
  const projectResponse = await fetchCircleCI(
    `/api/v2/project/github/${owner}/${repo}`
  )
  const projectId = projectResponse.id
  console.log(`✓ Project ID: ${projectId}`)

  // Get the most recent pipeline
  const pipelinesResponse = await fetchCircleCI(
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

  // Look up context IDs using paginated API
  let contextIds = []
  if (contextNames.length > 0) {
    console.log(
      `✓ Found ${contextNames.length} context(s): ${contextNames.join(', ')}`
    )
    console.log('\nFetching context IDs from CircleCI API...')
    contextIds = await fetchContextIds(orgSlug, contextNames)
    if (contextIds.length > 0) {
      console.log(`✓ Found ${contextIds.length} context ID(s)`)
    }
  } else {
    console.log('⚠ No contexts found in .circleci/config.yml')
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
      '-y',
      '--allow-publish',
      '--org-id',
      orgId,
      '--project-id',
      projectId,
      '--pipeline-definition-id',
      pipelineDefinitionId,
      '--vcs-origin',
      `github.com/${owner}/${repo}`,
      ...contextIds.flatMap((contextId) => ['--context-id', contextId]),
      ...(dryRun ? ['--dry-run'] : []),
    ]

    console.log(`\nExecuting: npm ${npmTrustArgs.join(' ')}`)
    await execa('npm', npmTrustArgs, { stdio: 'inherit' })
  }
}
