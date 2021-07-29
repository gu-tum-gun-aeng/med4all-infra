import * as pulumi from '@pulumi/pulumi'

export interface SubnetConfig {
  availability: string
  cidrBlock: string
}

export interface VpcConfig {
  name: string
  cidrBlock: string
}

export interface SecurityGroupConfig {
  name: string
}

export interface Config {
  network: {
    vpc: VpcConfig
    privateSubnetConfig: SubnetConfig[]
    publicSubnetConfig: SubnetConfig[]
    elasticIpName: string
  }
  securityGroup: SecurityGroupConfig
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
