import * as pulumi from '@pulumi/pulumi'
import { Network } from '../types/network'
import * as Eks from './eks'
import Config from './config'
import { createRoleForCloudwatchSA } from './iam'

const clusterStackRef = new pulumi.StackReference(Config.stackReference)
const outputNetwork = clusterStackRef.getOutput(
  'createdNetwork'
) as pulumi.Output<Network>

const outputKubernetesConfig = outputNetwork.apply((network: Network) => {
  const createdEks = Eks.create(Config.eks, network.vpc, network.privateSubnets)
  const kubernetesConfig = createdEks.kubeconfig

  const localEks = Eks.create(
    Config.localEks,
    network.vpc,
    network.privateSubnets
  )
  const localKubernetesConfig = localEks.kubeconfig

  createdEks.eksCluster.core.oidcProvider?.url.apply((url) =>
    createRoleForCloudwatchSA(Config.eks.cloudWathcRoleName, url)
  )

  return {
    kubernetesConfig,
    localKubernetesConfig,
  }
})

export const kubeconfig = outputKubernetesConfig.kubernetesConfig
export const localKubeconfig = outputKubernetesConfig.localKubernetesConfig
export const eksClusterId = Config.eks.clusterId
export const localEksClusterId = Config.localEks.clusterId
