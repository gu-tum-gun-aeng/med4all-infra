import * as aws from '@pulumi/aws'

export interface Network {
  vpc: aws.ec2.Vpc
  publicSubnets: aws.ec2.Subnet[]
  privateSubnets: aws.ec2.Subnet[]
  securityGroup: aws.ec2.SecurityGroup
}
