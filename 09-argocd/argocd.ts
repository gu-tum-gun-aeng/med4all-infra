import * as k8s from '@pulumi/kubernetes'

export interface ArgoCd {
  argoCd: k8s.yaml.ConfigFile
  argoCdIngress: k8s.yaml.ConfigFile
}

const create = (provider: k8s.Provider): ArgoCd => {
  const namespace = createNamespace(provider)
  const argoCd = applyArgoCdConfig(provider, namespace)
  const argoCdIngress = applyArgoCdIngressConfig(provider, namespace)
  return { argoCd, argoCdIngress }
}

const createNamespace = (provider: k8s.Provider): k8s.core.v1.Namespace => {
  const name = 'argocd'
  return new k8s.core.v1.Namespace(
    'argocd-ns',
    {
      metadata: { name: name },
    },
    { provider }
  )
}

const argoTransformationForMetatdataName = (
  config: any,
  nameSpace: k8s.core.v1.Namespace
) => {
  if (config && config.metadata) {
    config.metadata.namespace = nameSpace.metadata.name
    return
  }

  if (config) {
    config.metadata = { namespace: nameSpace.metadata.name }
    return
  }
}

const applyArgoCdConfig = (
  provider: k8s.Provider,
  nameSpace: k8s.core.v1.Namespace
) =>
  new k8s.yaml.ConfigFile(
    'argoCd',
    {
      file: 'argocd.yaml',
      transformations: [
        (config) => argoTransformationForMetatdataName(config, nameSpace),
      ],
    },
    { provider }
  )

const applyArgoCdIngressConfig = (
  provider: k8s.Provider,
  nameSpace: k8s.core.v1.Namespace
) =>
  new k8s.yaml.ConfigFile(
    'argoCdConfig',
    {
      file: 'argocd-ingress.yaml',
      transformations: [
        (config) => argoTransformationForMetatdataName(config, nameSpace),
      ],
    },
    { provider }
  )

export default {
  create,
}
