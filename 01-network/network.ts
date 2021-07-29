import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import { Config, SubnetConfig, VpcConfig } from './config'
import { Network } from '../types/network'

const create = (config: Config): Network => {
  const {
    vpc: vpcConfig,
    publicSubnetConfig,
    privateSubnetConfig,
    elasticIpName,
  } = config.network

  const createdVpc = createVpc(vpcConfig)

  const [publicRouteTable] = createRoute(createdVpc, BOUNDARY.PUBLIC)
  const createdPublicSubnets = publicSubnetConfig.map(
    (publicSubnet, publicSubnetIndex) => {
      const createdPublicSubnet = createSubnet(
        createdVpc,
        publicSubnet,
        BOUNDARY.PUBLIC
      )
      const routeTableAssociationName =
        `route-table-association-${BOUNDARY.PUBLIC}-${publicSubnetIndex}` as const
      associateSubnetWithRoute(
        routeTableAssociationName,
        createdPublicSubnet,
        publicRouteTable
      )
      return createdPublicSubnet
    }
  )

  const createdPrivateSubnets = privateSubnetConfig.map((privateSubnet) =>
    createSubnet(createdVpc, privateSubnet, BOUNDARY.PRIVATE)
  )

  const elasticIpNatGateway = createElasticNatIp(elasticIpName)

  const natGateway = createNatGateway(
    elasticIpNatGateway.id,
    createdPublicSubnets[0].id
  )

  const natGatewayRoute = createNatGatewayRouteTable(
    createdVpc.id,
    natGateway.id
  )

  associatePrivateSubnetNatGateway(createdPrivateSubnets, natGatewayRoute.id)
  const createdSecurityGroup = createSecurityGroup(createdVpc, config)
  return {
    vpc: createdVpc,
    privateSubnets: createdPrivateSubnets,
    publicSubnets: createdPublicSubnets,
    securityGroup: createdSecurityGroup,
  }
}

export type Boundary = 'private' | 'public'
const BOUNDARY = {
  PRIVATE: 'private',
  PUBLIC: 'public',
} as const

const createVpc = (vpc: VpcConfig): aws.ec2.Vpc => {
  const createdVpc = new aws.ec2.Vpc(vpc.name, {
    cidrBlock: vpc.cidrBlock,
    enableDnsHostnames: true,
    tags: {
      Name: vpc.name,
    },
  })
  return createdVpc
}

const createSubnet = (
  vpc: aws.ec2.Vpc,
  subnet: SubnetConfig,
  boundary: Boundary
): aws.ec2.Subnet => {
  return new aws.ec2.Subnet(`${boundary}-subnet-${subnet.availability}`, {
    vpcId: vpc.id,
    cidrBlock: subnet.cidrBlock,
    availabilityZone: subnet.availability,
    tags: {
      Name: `${boundary}-subnet-${subnet.availability}`,
    },
  })
}

/** create route with associate route table and internet gateway */
const createRoute = (
  vpc: aws.ec2.Vpc,
  boundary: Boundary
): [aws.ec2.RouteTable, aws.ec2.Route] => {
  const routeTable = new aws.ec2.RouteTable(`${boundary}-route-table`, {
    vpcId: vpc.id,
    tags: {
      Name: `${boundary}-route-table`,
    },
  })
  const internetGateway = new aws.ec2.InternetGateway('internet-gateway', {
    vpcId: vpc.id,
    tags: {
      Name: 'internet-gateway',
    },
  })

  const route = new aws.ec2.Route(`${boundary}-route`, {
    routeTableId: routeTable.id,
    destinationCidrBlock: '0.0.0.0/0',
    gatewayId: internetGateway.id,
  })

  return [routeTable, route]
}

const createSecurityGroup = (createdVpc: aws.ec2.Vpc, config: Config) =>
  new aws.ec2.SecurityGroup(config.securityGroup.name, {
    vpcId: createdVpc.id,
    ingress: [
      {
        protocol: '-1',
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ['0.0.0.0/0'],
        ipv6CidrBlocks: ['::/0'],
      },
    ],
    tags: {
      Name: config.securityGroup.name,
    },
  })

type RouteTableAssociationName = `route-table-association-${Boundary}-${number}`
const associateSubnetWithRoute = (
  routeTableAssociationName: RouteTableAssociationName,
  subnet: aws.ec2.Subnet,
  routeTable: aws.ec2.RouteTable
): void => {
  new aws.ec2.RouteTableAssociation(routeTableAssociationName, {
    subnetId: subnet.id,
    routeTableId: routeTable.id,
  })
}

const createElasticNatIp = (elasticIpName: string) =>
  new aws.ec2.Eip('elastic-ip-nat-gateway', {
    tags: {
      Name: elasticIpName,
    },
    vpc: true,
  })

const createNatGateway = (
  elasticIpNatGatewayId: pulumi.Output<string>,
  subnetId: pulumi.Output<string>
) =>
  new aws.ec2.NatGateway('nat-gateway', {
    allocationId: elasticIpNatGatewayId,
    subnetId: subnetId,
  })

const createNatGatewayRouteTable = (
  vpcId: pulumi.Output<string>,
  natGatewayId: pulumi.Output<string>
) =>
  new aws.ec2.RouteTable('nat-gateway-route', {
    vpcId: vpcId,
    routes: [{ cidrBlock: '0.0.0.0/0', natGatewayId: natGatewayId }],
  })

const associatePrivateSubnetNatGateway = (
  createdPrivateSubnets: aws.ec2.Subnet[],
  natGatewayRouteId: pulumi.Output<string>
) =>
  createdPrivateSubnets.map((privateSubnet, index) => {
    new aws.ec2.RouteTableAssociation(`private-subnet-rta-${index}`, {
      routeTableId: natGatewayRouteId,
      subnetId: privateSubnet.id,
    })
  })

export default {
  create,
}
