import * as pulumi from '@pulumi/pulumi'

export interface Config {
  customDomainName: string[]
  route53ZoneName: string
  certification: Certification
}

interface Certification {
  name: string
  validationMethod: string
  recordName: string
  recordValidationName: string
}

const pulumiConfig = new pulumi.Config()
const config = pulumiConfig.requireObject<Config>('config')
export default config
