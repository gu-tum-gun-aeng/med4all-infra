import * as pulumi from '@pulumi/pulumi'

export interface Config {
  eksStackReference: string
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
