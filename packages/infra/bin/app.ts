import * as cdk from 'aws-cdk-lib'
import { TravelAiStack } from '../lib/travel-ai-stack'

const app = new cdk.App()

new TravelAiStack(app, 'TravelAiStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
})
