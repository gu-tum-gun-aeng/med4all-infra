import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

export interface RdsConfig {
  dbName: string
  username: string
  password: string
  nCluster: number
  clusterId: string
  clusterInstanceId: string
  skipFinalSnapshot: boolean
  subnetGroupName: string
  instanceType: aws.rds.InstanceType
}

export interface Config {
  stackReference: string
  rds: RdsConfig
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
