import * as aws from '@pulumi/aws'
import { Network } from '../types/network'
import { Config } from './config'

const create = (
  config: Config,
  network: Network
): {
  cluster: aws.msk.Cluster
  clusterSecurityGroup: aws.ec2.SecurityGroup
} => {
  const clusterSecurityGroup = network.securityGroup

  const cluster = new aws.msk.Cluster(config.clusterName, {
    kafkaVersion: config.kafkaVersion,
    numberOfBrokerNodes: config.brokerNumberNode,
    brokerNodeGroupInfo: {
      instanceType: config.brokerInstanceType,
      ebsVolumeSize: config.brokerEbsVolumeSize,
      clientSubnets: network.privateSubnets.map(
        (privateSubnet) => privateSubnet.id
      ),
      securityGroups: [clusterSecurityGroup.id],
    },
    tags: {
      Name: config.clusterName,
    },
  })

  return {
    cluster,
    clusterSecurityGroup,
  }
}

export default {
  create,
}
