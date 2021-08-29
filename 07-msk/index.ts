import * as pulumi from '@pulumi/pulumi'
import Config from './config'
import Cluster from './cluster'
import { Network } from '../types/network'
import clusterConfig from './cluster-config'

const clusterStackRef = new pulumi.StackReference(Config.stackReference)
const outputNetwork = clusterStackRef.getOutput(
  'createdNetwork'
) as pulumi.Output<Network>

export const mskClusterConfig = clusterConfig.create(Config)

export const mskCluster = outputNetwork.apply((network: Network) => {
  return Cluster.create(Config, network, mskClusterConfig)
})
