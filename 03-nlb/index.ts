import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import Config from './config'
import Nlb from './nlb'

const eksStackReference = new pulumi.StackReference(Config.eksStackReference)
const kubeconfig = eksStackReference.getOutput(Config.kubeConfigName)
const provider = new k8s.Provider('k8sProvider', { kubeconfig })

export const nlb = Nlb.create(Config.name, provider)
