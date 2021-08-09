import * as pulumi from '@pulumi/pulumi'

export interface Config {
  networkStackReference: string
  eksStackReference: string
  customDomainName: string[]
  certificate: Certificate
  route53ZoneName: string
  awsSdkResourceGroupsTaggingApi: AwsSdkResourceGroupsTaggingApi
  vpcLink: VpcLink
  apiGateway: ApiGateway
  stage: Stage
  integration: Integration
  route: Route
  apiGatewayDomainName: ApiGatewayDomainName
  route53Record: Route53Record
  basePathMapping: BasePathMapping
}

interface ApiGatewayDomainName {
  name: string
  endpointConfigurationType: string
  securityPolicy: string
}

interface Route53Record {
  name: string
  type: string
  ttl: number
}

interface BasePathMapping {
  name: string
}

interface Certificate {
  type: string
}

interface Route {
  name: string
}

interface AwsSdkResourceGroupsTaggingApi {
  apiVersion: string
  resourceTypeFilters: string
}

interface VpcLink {
  name: string
  description: string
}

interface ApiGateway {
  name: string
  description: string
  endpointConfigurationType: string
}

interface Stage {
  name: string
  stageName: string
}

interface Integration {
  name: string
  type: string
  integrationHttpMethod: string
  connectionType: string
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
