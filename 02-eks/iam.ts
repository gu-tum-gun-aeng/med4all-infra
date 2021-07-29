import * as aws from '@pulumi/aws'

/** Creates a role and attaches the EKS worker node IAM managed policies. Used a few times below,
to create multiple roles, so we use a function to avoid repeating ourselves. */
export const createRole = (name: string): aws.iam.Role => {
  const managedPolicyArns: string[] = [
    'arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy',
    'arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy',
    'arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly',
    'arn:aws:iam::aws:policy/SecretsManagerReadWrite',
    'arn:aws:iam::aws:policy/AmazonS3FullAccess',
  ]
  const role = new aws.iam.Role(name, {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
      Service: 'ec2.amazonaws.com',
    }),
  })

  managedPolicyArns.forEach(
    (policy, index) =>
      new aws.iam.RolePolicyAttachment(`${name}-policy-${index}`, {
        policyArn: policy,
        role: role,
      })
  )

  return role
}

export const createRoleForCloudwatchSA = (
  name: string,
  oidcProviderUrl: string
): aws.iam.Role => {
  const oidcUrl = `oidc.eks.ap-southeast-1.amazonaws.com/id/${oidcProviderUrl}:aud`
  const role = new aws.iam.Role(name, {
    assumeRolePolicy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Federated: `arn:aws:iam::106615695899:oidc-provider/oidc.eks.ap-southeast-1.amazonaws.com/id/${oidcProviderUrl}`,
          },
          Action: 'sts:AssumeRoleWithWebIdentity',
          Condition: {
            StringEquals: {
              [oidcUrl]: 'sts.amazonaws.com',
            },
          },
        },
      ],
    }),
  })

  return role
}
