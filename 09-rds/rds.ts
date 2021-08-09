import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import { Config, RdsConfig } from './config'
import { Network } from '../types/network'
import {
  generateArrayNaturalNumberFrom,
  getModifiedCurrentIsoDateString,
} from '../utils'

const create = (config: Config, network: Network): Rds => {
  const subnetGroup = createSubnetGroup(
    config.rds.subnetGroupName,
    network.privateSubnets
  )
  const privateSubnetAvailabilityZones = network.privateSubnets.map(
    (privateSubnet) => privateSubnet.availabilityZone
  )
  const cluster = createCluster(
    config.rds,
    privateSubnetAvailabilityZones,
    subnetGroup,
    network
  )
  const clusterInstances = createClusterInstances(
    config.rds,
    subnetGroup,
    cluster
  )

  return {
    cluster,
    clusterInstances,
  }
}

const createSubnetGroup = (
  subnetGroupName: string,
  subnets: aws.ec2.Subnet[]
): aws.rds.SubnetGroup => {
  const subnetGroup = new aws.rds.SubnetGroup(subnetGroupName, {
    subnetIds: subnets.map((subnet) => subnet.id),
    name: subnetGroupName,
    tags: {
      Name: subnetGroupName,
    },
  })
  return subnetGroup
}

const createCluster = (
  rds: RdsConfig,
  availabilityZones: pulumi.Output<string>[],
  subnetGroup: aws.rds.SubnetGroup,
  network: Network
): aws.rds.Cluster => {
  const cluster = new aws.rds.Cluster(`${rds.clusterId}`, {
    vpcSecurityGroupIds: [network.securityGroup.id],
    availabilityZones: availabilityZones,
    clusterIdentifier: rds.clusterId,
    databaseName: rds.dbName,
    engine: 'aurora-postgresql',
    masterPassword: rds.password,
    masterUsername: rds.username,
    dbSubnetGroupName: subnetGroup.name,
    skipFinalSnapshot: rds.skipFinalSnapshot,
    finalSnapshotIdentifier: `db-snapshot-${
      rds.clusterId
    }-${getModifiedCurrentIsoDateString()}`,
  })
  return cluster
}

const createClusterInstances = (
  rds: RdsConfig,
  subnetGroup: aws.rds.SubnetGroup,
  cluster: aws.rds.Cluster
): aws.rds.ClusterInstance[] => {
  const nCluster: number[] = generateArrayNaturalNumberFrom(rds.nCluster)
  const clusterInstances = nCluster.map((n) => {
    return new aws.rds.ClusterInstance(`${rds.clusterInstanceId}-${n}`, {
      identifier: `${rds.clusterInstanceId}-${n}`,
      clusterIdentifier: cluster.id,
      instanceClass: rds.instanceType,
      engine: 'aurora-postgresql',
      engineVersion: cluster.engineVersion,
      dbSubnetGroupName: subnetGroup.name,
      tags: {
        Name: `${rds.clusterInstanceId}-${n}`,
      },
    })
  })
  return clusterInstances
}

export interface Rds {
  cluster: aws.rds.Cluster
  clusterInstances: aws.rds.ClusterInstance[]
}

export default {
  create,
}
