import * as pulumi from '@pulumi/pulumi'

export interface Config {
  name: string
  kubeConfigName: string
  eksStackReference: string
  ingressDeploymentFilename: string
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
