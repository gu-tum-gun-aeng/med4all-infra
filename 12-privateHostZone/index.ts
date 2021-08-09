import * as pulumi from '@pulumi/pulumi'
import Config from './config'
import { Network } from '../types/network'
import { ElasticsearchDomain } from '../08-elasticsearch/elasticsearch'
import privateHostZone from './privateHostZone'

const clusterStackRef = new pulumi.StackReference(Config.stackReference)
const outputNetwork = clusterStackRef.getOutput(
  'createdNetwork'
) as pulumi.Output<Network>

const esStackReference = new pulumi.StackReference(Config.esStackReference)
const elasticsearchDomain = esStackReference.getOutput(
  'elasticsearchDomain'
) as pulumi.Output<ElasticsearchDomain>

const eksStackReference = new pulumi.StackReference(Config.eksStackReference)
const kubeClusterIdTag = eksStackReference
  .getOutput('localEksClusterId')
  .apply((id) => `kubernetes.io/cluster/${id}`)

pulumi.all([outputNetwork, elasticsearchDomain]).apply((result) => {
  return privateHostZone.create(result[0], result[1], kubeClusterIdTag)
})
