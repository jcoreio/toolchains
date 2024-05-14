# @jcoreio/toolchain-aws-lambda

This project deploys an AWS Lambda Function from JS or TS source.

## Features

- Supports `.env` file, you can put AWS credentials, `AWS_SDK_LOAD_CONFIG=1`, `AWS_REGION` etc in `.env` if you like
- Adds the `tc deploy` script, which deploys to AWS
- Uses `pack-lambda` to stream the source to S3, supporting `pnpm`
- If you use `@jcoreio/toolchain-semantic-release`, will deploy in CI

## Conventions

The project must contain `scripts/cloudFormationTemplate.js` (or `.ts` if you're using `@jcoreio/toolchain-typescript`)
that exports the following:

- `StackName` (optional) - the name for the CloudFormation Stack (defaults to the Lambda FunctionName)
- `Template` - the CloudFormation template
- `Parameters` (optional) - the parameters for the template
- `Capabilities` - the capabilities to use when deploying the stack
- `Tags` (options) - the tags for the CloudFormation Stack

The `Template` must contain one `AWS::Lambda::Function` or `AWS::Serverless::Function`. It will provide defaults
for the following properties, so they are optional:

- `Description`: defaults to the `description` in `package.json`
- `CodeUri`: defaults the `Bucket` to the AWS Account, and the
  `Key` to something based upon the `name` in `package.json`
- `Handler`: defaults to the `handler` export in the `main` file
  in `package.json`
- `Runtime`: defaults to `nodejs20.x`
- `FunctionName`: defaults to something based upon the `name` in `package.json`
