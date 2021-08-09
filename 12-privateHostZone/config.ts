import * as pulumi from '@pulumi/pulumi'

export interface Config {
  stackReference: string
  eksStackReference: string
  esStackReference: string
  privateHostZoneName: string
  route53EsRecordName: string
  dashboardDomainNames: string[]
  awsSdkResourceGroupsTaggingApi: AwsSdkResourceGroupsTaggingApi
  route53RecordTtl: number
  route53RecordType: string
}

interface AwsSdkResourceGroupsTaggingApi {
  apiVersion: string
  resourceTypeFilters: string
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
