import * as aws from '@pulumi/aws'
import { Network } from '../types/network'
import { Config } from './config'
import { ClusterConfig } from './cluster-config'

const create = (
  config: Config,
  network: Network,
  clusterConfig: ClusterConfig
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
    configurationInfo: {
      arn: clusterConfig.clusterConfig.arn,
      revision: clusterConfig.clusterConfig.latestRevision,
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
