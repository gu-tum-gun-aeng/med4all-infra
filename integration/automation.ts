import {
  LocalProgramArgs,
  LocalWorkspace,
  OutputMap,
  Deployment,
} from '@pulumi/pulumi/automation'
import * as path from 'path'

const ORGANIZATION = 'med4all'

const fullyQualifiedStackName = (
  organization: string,
  stack: string
): `${string}/${string}` => `${organization}/${stack}`

const stackName = fullyQualifiedStackName(
  ORGANIZATION,
  `integration-${process.env.PR_NUMBER}`
)

const localProgramArgs: LocalProgramArgs = {
  stackName,
  workDir: path.join(__dirname, '../01-network'),
}

export const deploy = async (): Promise<OutputMap> => {
  const stack = await LocalWorkspace.createOrSelectStack(localProgramArgs)
  await stack.setConfig('aws:region', { value: 'ap-southeast-1' })
  const up = await stack.up({ onOutput: console.log })

  return up.outputs
}

export const destroy = async (): Promise<void> => {
  const stack = await LocalWorkspace.createOrSelectStack(localProgramArgs)
  await stack.destroy({ onOutput: console.log })
}

export const removeStack = async (): Promise<void> => {
  const stack = await LocalWorkspace.selectStack(localProgramArgs)
  await stack.workspace.removeStack(stackName)
}

export const getOuputs = async (): Promise<OutputMap> => {
  const stack = await LocalWorkspace.selectStack(localProgramArgs)

  const outputs = stack.outputs()

  return outputs
}

export const getStacks = async (): Promise<Deployment> => {
  const stack = await LocalWorkspace.selectStack(localProgramArgs)

  const stacks = stack.exportStack()

  return stacks
}

export default {
  deploy,
  getOuputs,
  destroy,
  getStacks,
  removeStack,
}
