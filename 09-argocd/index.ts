import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import Config from './config'
import ArgoCD from './argocd'

const eksStackReference = new pulumi.StackReference(Config.eksStackReference)
const kubeconfig = eksStackReference.getOutput('localKubeconfig')
const provider = new k8s.Provider('k8sProvider', { kubeconfig })
export const argocd = ArgoCD.create(provider)
