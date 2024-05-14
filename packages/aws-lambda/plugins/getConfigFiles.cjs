const dedent = require('dedent-js')
const { toolchainPackages } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  async function getConfigFiles() {
    const isTS = toolchainPackages.includes('@jcoreio/toolchain-typescript')
    const files = {
      [`src/index.${isTS ? 'ts' : 'js'}`]: dedent`
        // eslint-disable-next-line @jcoreio/implicit-dependencies/no-implicit
        import type { Handler } from 'aws-lambda'

        export const handler: Handler = async (event, context) => {
          
        }
      `,
      [`scripts/cloudFormationTemplate.${isTS ? 'ts' : 'js'}`]: dedent`
        // export const StackName = 'StackName'

        export const Template = {
          AWSTemplateFormatVersion: '2010-09-09',
          // Description: 'Template Descrption',
          Transform: 'AWS::Serverless-2016-10-31',
          Parameters: {

          },
          Resources: {
            LambdaFunction: {
              Type: 'AWS::Serverless::Function',
              Properties: {
                MemorySize: 128,
                Timeout: 60,
                // CodeUri: {
                //   Bucket: 'BucketName',
                // },
              },
            },
          },
          Outputs: {
            LambdaFunction: { Value: { Ref: 'LambdaFunction' } },
          },
        }
        
        export const Parameters = {

        }
        
        export const Capabilities = ['CAPABILITY_IAM']

        export const Tags = {

        }
      `,
    }
    return files
  },
]
