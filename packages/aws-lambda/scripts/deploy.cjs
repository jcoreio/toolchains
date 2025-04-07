const {
  projectDir,
  toolchainPackages,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const path = require('path')
const { inspect } = require('util')
const z = require('zod').default

const TemplateModuleSchema = z.strictObject({
  StackName: z.string().optional(),
  Parameters: z.record(z.any()).optional(),
  Template: z
    .object({
      Parameters: z
        .record(
          z
            .object({
              Type: z.string(),
              Description: z.string().optional(),
              Default: z.any().optional(),
            })
            .passthrough()
        )
        .optional(),
      Resources: z.record(z.object({ Type: z.string() }).passthrough()),
    })
    .passthrough(),
  Capabilities: z
    .array(
      z.enum([
        'CAPABILITY_IAM',
        'CAPABILITY_NAMED_IAM',
        'CAPABILITY_AUTO_EXPAND',
      ])
    )
    .optional(),
  Tags: z
    .union([
      z.record(z.string()),
      z.array(z.object({ Tag: z.string(), Value: z.string() })),
    ])
    .optional(0),
})

module.exports = async function deploy() {
  const packageJsonFile = path.join(projectDir, 'dist', 'package.json')
  const packageJson = await fs.readJson(packageJsonFile)
  require('dotenv').config()

  const { uploadToS3 } = require('@jcoreio/pack-lambda')
  const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3')
  const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts')
  const { deployCloudFormationStack } = require('@jcoreio/cloudformation-tools')

  if (toolchainPackages.includes('@jcoreio/toolchain-esnext')) {
    require(
      require.resolve('@jcoreio/toolchain-esnext/util/babelRegister.cjs', {
        paths: [projectDir],
      })
    )
  }
  const templatePath = path.join(
    projectDir,
    'scripts',
    'cloudFormationTemplate'
  )
  const templateModule = TemplateModuleSchema.parse(require(templatePath))
  const { Template, Parameters, Capabilities, Tags } = templateModule
  let { StackName } = templateModule

  if (!Template.Description) Template.Description = packageJson.Description

  const [lambda, ...excessLambdas] = Object.entries(
    Template.Resources || {}
  ).filter(
    ([key, value]) =>
      value.Type === 'AWS::Serverless::Function' ||
      value.Type === 'AWS::Lambda::Function'
  )
  if (!lambda) {
    throw new Error(
      `Missing lambda function in Template export in ${path.relative(
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
    throw new Error(`Missing Properties on ${lambdaResourceName} resource`)
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

  const isServerless = lambdaResource.Type === 'AWS::Serverless::Function'

  // Adapt between janky difference between AWS::Serverless::Function and AWS::Lambda::Function
  const adapter = isServerless
    ? {
        get Code() {
          const { CodeUri } = lambdaResource
          return CodeUri
            ? {
                get S3Bucket() {
                  return CodeUri.Bucket
                },
                set S3Bucket(value) {
                  CodeUri.Bucket = value
                },
                get S3Key() {
                  return CodeUri.Key
                },
                set S3Key(value) {
                  CodeUri.Key = value
                },
              }
            : undefined
        },
        set Code(value) {
          lambdaResource.CodeUri = {
            Bucket: value.S3Bucket,
            Key: value.S3Key,
          }
        },
      }
    : lambdaResource.Properties

  if (!adapter.Code) adapter.Code = {}
  const { Code } = Properties

  if (!Code.S3Bucket) {
    const sts = new STSClient()
    const { Account } = await sts.send(new GetCallerIdentityCommand({}))
    // eslint-disable-next-line no-console
    console.error(
      `Defaulting Lambda ${
        isServerless ? 'CodeUri.Bucket' : 'Code.S3Bucket'
      } to AWS Account: ${Account}`
    )
    Code.S3Bucket = Account
  }

  let Bucket = Code.S3Bucket
  if (Code.S3Bucket instanceof Object) {
    if (Code.S3Bucket.Ref) {
      Bucket =
        Parameters[Code.S3Bucket.Ref] ||
        (Template.Parameters[Code.S3Bucket.Ref] || {}).Default
    }
    throw new Error(
      `Lambda ${
        isServerless ? 'CodeUri.Bucket' : 'Code.S3Bucket'
      } format not supported: ${inspect(Bucket)}`
    )
  }

  let Key = Code.S3Key

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
    useHash: true,
  }))
  Code.S3Key = Key

  if (!Properties.Runtime) {
    Properties.Runtime = `nodejs20.x`
    // eslint-disable-next-line no-console
    console.error(`Defaulting Lambda Runtime to ${Properties.Runtime}`)
  }

  if (!Properties.FunctionName) {
    Properties.FunctionName = packageJson.name
      .replace(/[^-a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    // eslint-disable-next-line no-console
    console.error(
      `Defaulting Lambda FunctionName to ${Properties.FunctionName}`
    )
  }

  if (!StackName) {
    StackName = Properties.FunctionName.replace(/[^-a-z0-9]+/g, '-').replace(
      /^-+|-+$/g,
      ''
    )
    // eslint-disable-next-line no-console
    console.error(`Defaulting StackName to ${StackName}`)
  }

  await deployCloudFormationStack({
    StackName,
    Template,
    Parameters,
    Capabilities,
    Tags,
  })
}
