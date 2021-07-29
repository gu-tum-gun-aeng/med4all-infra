import * as pulumi from '@pulumi/pulumi'

export interface S3Config {
  bucketName: string
  acl: string
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<S3Config>('config')
export default config
