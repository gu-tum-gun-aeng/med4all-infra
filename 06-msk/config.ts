import * as pulumi from '@pulumi/pulumi'

export interface Config {
  clusterName: string
  stackReference: string
  brokerInstanceType: string
  brokerNumberNode: number
  brokerEbsVolumeSize: number
  kafkaVersion: string
  securityGroupName: string
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
