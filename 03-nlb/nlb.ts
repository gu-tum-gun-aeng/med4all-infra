import * as k8s from '@pulumi/kubernetes'
import * as config from './config'

const applyNlbConfig = (name: string, provider: k8s.Provider) =>
  new k8s.yaml.ConfigFile(
    name,
    {
      file: config.default.ingressDeploymentFilename,
    },
    { provider }
  )

const create = (name: string, provider: k8s.Provider): k8s.yaml.ConfigFile => {
  return applyNlbConfig(name, provider)
}

export default {
  create,
}
