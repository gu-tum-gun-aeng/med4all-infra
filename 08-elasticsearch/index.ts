import * as pulumi from '@pulumi/pulumi'
import ElasticsearchDomain from './elasticsearch'
import Config from './config'
import { Network } from '../types/network'

const clusterStackRef = new pulumi.StackReference(Config.stackReference)
const outputNetwork = clusterStackRef.getOutput(
  'createdNetwork'
) as pulumi.Output<Network>

export const elasticsearchDomain = outputNetwork.apply((network: Network) => {
  return ElasticsearchDomain.create(Config.elasticsearch, network)
})
