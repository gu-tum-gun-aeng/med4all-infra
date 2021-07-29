import * as eks from '@pulumi/eks'
import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import { EksConfig } from './config'
import { createRole } from './iam'

export const create = (
  eksConfig: EksConfig,
  vpc: aws.ec2.Vpc,
  privateSubnets: aws.ec2.Subnet[]
): Eks => {
  const subnetIds = privateSubnets.map((subnet) => subnet.id)
  const workerGroupRole = createWorkerGroupRole(eksConfig)
  const eksCluster = createEksCluster(
    eksConfig,
    vpc,
    subnetIds,
    workerGroupRole
  )
  const spotNodeGroup = createSpotNodeGroup(
    eksConfig,
    eksCluster,
    workerGroupRole
  )

  return {
    eksCluster,
    spotNodeGroup,
    kubeconfig: eksCluster.kubeconfig,
  }
}

export interface Eks {
  eksCluster: eks.Cluster
  spotNodeGroup: eks.NodeGroup
  kubeconfig: pulumi.Output<any>
}

interface WorkerGroupRole {
  role: aws.iam.Role
  instanceProfile: aws.iam.InstanceProfile
}

const createWorkerGroupRole = (eksConfig: EksConfig): WorkerGroupRole => {
  const role = createRole(eksConfig.roleName)
  const instanceProfile = new aws.iam.InstanceProfile(eksConfig.profileName, {
    role,
  })

  return {
    role,
    instanceProfile,
  }
}

/** Create an EKS cluster with many IAM roles to register with the cluster auth. */
const createEksCluster = (
  eksConfig: EksConfig,
  vpc: aws.ec2.Vpc,
  subnetIds: pulumi.Output<string>[],
  workerGroupRole: WorkerGroupRole
): eks.Cluster =>
  new eks.Cluster(eksConfig.clusterId, {
    vpcId: vpc.id,
    subnetIds: subnetIds,
    skipDefaultNodeGroup: true,
    createOidcProvider: true,
    instanceRoles: [workerGroupRole.role],
    tags: {
      Name: eksConfig.clusterId,
    },
    clusterSecurityGroupTags: { ClusterSecurityGroupTag: 'true' },
    nodeSecurityGroupTags: { NodeSecurityGroupTag: 'true' },
    enabledClusterLogTypes: [
      'api',
      'audit',
      'authenticator',
      'controllerManager',
      'scheduler',
    ],
    name: eksConfig.clusterId,
    roleMappings: [
      {
        roleArn: workerGroupRole.role.arn,
        username: 'pulumi:admin-usr',
        groups: ['system:masters'],
      },
    ],
  })

/** Now create a preemptible node group, using spot pricing, for our variable, ephemeral workloads. */
const createSpotNodeGroup = (
  eksConfig: EksConfig,
  eksCluster: eks.Cluster,
  workerGroupRole: WorkerGroupRole
): eks.NodeGroup =>
  new eks.NodeGroup(
    eksConfig.nodeGroupId,
    {
      cluster: eksCluster,
      instanceType: eksConfig.instanceType,
      desiredCapacity: eksConfig.desireCapacity,
      spotPrice: '1',
      minSize: eksConfig.minSize,
      maxSize: eksConfig.maxSize,
      instanceProfile: workerGroupRole.instanceProfile,
    },
    {
      providers: { kubernetes: eksCluster.provider },
    }
  )

export default {
  create,
}
