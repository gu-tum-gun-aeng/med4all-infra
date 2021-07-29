import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'
import Config from './config'
import Rds from './rds'
import { Network } from '../types/network'

const clusterStackRef = new pulumi.StackReference(Config.stackReference)
const outputNetwork = clusterStackRef.getOutput(
  'createdNetwork'
) as pulumi.Output<Network>
let createdRdsCluster: aws.rds.Cluster
outputNetwork.apply((network: Network) => {
  const { cluster } = Rds.create(Config, network)
  createdRdsCluster = cluster
})

export { createdRdsCluster }
