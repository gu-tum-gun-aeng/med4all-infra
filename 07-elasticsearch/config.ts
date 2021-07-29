import * as pulumi from '@pulumi/pulumi'

export interface ElasticsearchConfig {
  name: string
  instanceType: string
  route53RecordPulumiName: string
  route53RecordType: string
  route53RecordName: string
  route53Ttl: number
}

export interface Config {
  stackReference: string
  stackReferenceRoute53: string
  elasticsearch: ElasticsearchConfig
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
