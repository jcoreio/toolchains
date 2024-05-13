const {
  projectDir,
  toolchainPackages,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const { uploadToS3 } = require('@jcoreio/pack-lambda')
const path = require('path')
const { inspect } = require('util')
const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3')
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts')
const { deployCloudFormationStack } = require('@jcoreio/cloudformation-tools')

module.exports = async function deploy() {
  const packageJsonFile = path.join(projectDir, 'dist', 'package.json')
  const packageJson = await fs.readJson(packageJsonFile)
  require('dotenv').config()

  if (toolchainPackages.includes('@jcoreio/toolchain-esnext')) {
    // eslint-disable-next-line @jcoreio/implicit-dependencies/no-implicit
    require(require.resolve(
      '@jcoreio/toolchain-esnext/util/babelRegister.cjs',
      { paths: [projectDir] }
    ))
  }
  const templatePath = path.join(
    projectDir,
    'scripts',
    'cloudFormationTemplate'
  )
  const templateModule = require(templatePath)
  const { Template, Parameters, Capabilities, Tags } = templateModule
  let { StackName } = templateModule

  const [lambda, ...excessLambdas] = Object.entries(
    Template.Resources || {}
  ).filter(
    ([key, value]) =>
      value.Type === 'AWS::Serverless::Function' ||
      value.Type === 'AWS::Lambda::Function'
  )
  if (!lambda) {
    throw new Error(
      `Missing lambda function in template export in ${path.relative(
        process.cwd(),
        templatePath
      )}`
    )
  }
  if (excessLambdas.length) {
    throw new Error(
      `${path.relative(
        process.cwd(),
        templatePath
      )} contains more than one lambda function, this is not supported`
    )
  }

  const [lambdaResourceName, lambdaResource] = lambda

  const { Properties } = lambdaResource
  if (!Properties) {
    throw new Error(`missing Properties on ${lambdaResourceName} resource`)
  }

  if (!Properties.Handler) {
    if (!packageJson.main) {
      throw new Error(
        `missing "Handler" in lambda function properties or "main" in ${path.relative(
          process.cwd(),
          packageJsonFile
        )}`
      )
    }
    Properties.Handler = packageJson.main.replace(/\.[^.]+$/, '.handler')
  }

  if (!Properties.CodeUri) Properties.CodeUri = {}
  const { CodeUri } = Properties

  if (!CodeUri.Bucket) {
    const sts = new STSClient()
    const { Account } = await sts.send(new GetCallerIdentityCommand({}))
    // eslint-disable-next-line no-console
    console.error(`Defaulting to S3 Bucket for account number: ${Account}`)
    CodeUri.Bucket = Account
  }

  let Bucket = CodeUri.Bucket
  if (CodeUri.Bucket instanceof Object) {
    if (CodeUri.Bucket.Ref) {
      Bucket =
        Parameters[CodeUri.Bucket.Ref] ||
        (Template.Parameters[CodeUri.Bucket.Ref] || {}).Default
    }
    throw new Error(`Bucket format not supported: ${inspect(Bucket)}`)
  }
  let Key = CodeUri.Key

  const s3 = new S3Client()
  try {
    await s3.send(new CreateBucketCommand({ Bucket }))
    // eslint-disable-next-line no-console
    console.error(`Created S3 Bucket: ${Bucket}`)
  } catch (error) {
    if (!error.stack.includes('BucketAlreadyOwnedByYou')) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  ;({ Key } = await uploadToS3({
    packageDir: path.resolve(projectDir, 'dist'),
    Bucket,
    Key,
  }))
  CodeUri.Key = Key

  if (!Properties.Runtime) {
    Properties.Runtime = `nodejs20.x`
  }

  if (!Properties.FunctionName) {
    Properties.FunctionName = packageJson.name
      .replace(/[^-a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  if (!StackName) {
    StackName = Properties.FunctionName.replace(/[^-a-z0-9]+/g, '-').replace(
      /^-+|-+$/g,
      ''
    )
  }

  await deployCloudFormationStack({
    StackName,
    Template,
    Parameters,
    Capabilities,
    Tags,
  })
}
