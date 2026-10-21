import * as cdk from 'aws-cdk-lib'
import type { Construct } from 'constructs'

export class TravelAiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    // Phase 7: Amplify Hosting, Lambda + API Gateway, CloudWatch, Budgets defined here
  }
}
