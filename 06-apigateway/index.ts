import * as pulumi from '@pulumi/pulumi'
import Config from './config'
import ApiGateway from './apigateway'

const networkStackReference = new pulumi.StackReference(
  Config.networkStackReference
)
const network = networkStackReference.getOutput('createdNetwork')

const eksStackReference = new pulumi.StackReference(Config.eksStackReference)
const kubeClusterIdTag = eksStackReference
  .getOutput('eksClusterId')
  .apply((id) => `kubernetes.io/cluster/${id}`)

export const apiGateway = pulumi
  .all([kubeClusterIdTag, network])
  .apply(([kubeClusterIdTagString, network]) =>
    ApiGateway.create(kubeClusterIdTagString, network)
  )
