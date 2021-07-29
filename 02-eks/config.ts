import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

export interface EksConfig {
  roleName: string
  profileName: string
  clusterId: string
  nodeGroupId: string
  instanceType: aws.ec2.InstanceType
  desireCapacity: number
  minSize: number
  maxSize: number
  cloudWathcRoleName: string
}

export interface Config {
  eks: EksConfig
  localEks: EksConfig
  stackReference: string
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
