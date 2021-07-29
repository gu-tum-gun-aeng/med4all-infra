import * as pulumi from '@pulumi/pulumi'
import Network from '../../01-network/network'
import { mockConfig } from './mock'
import { pulumiSetMock } from '../pulumi'

pulumiSetMock()

describe('Network', () => {
  const network = Network.create(mockConfig)

  describe('VPC', () => {
    test('should get cidr from config', function (done) {
      const { vpc } = network
      pulumi.all([vpc.urn, vpc.cidrBlock]).apply(([urn, cidrBlock]) => {
        if (cidrBlock && cidrBlock === mockConfig.network.vpc.cidrBlock) {
          done()
        } else {
          done(new Error(`Missing a name tag on server ${urn}`))
        }
      })
    })

    test('should get tags name with vpc if no environment variable provided', function (done) {
      const { vpc } = network
      pulumi.all([vpc.urn, vpc.tags]).apply(([urn, vpcTags]) => {
        if (vpcTags && vpcTags['Name'] === 'vpc-test') {
          done()
        } else {
          done(new Error(`Missing a name tag on server ${urn}`))
        }
      })
    })
  })

  describe('Subnet', () => {
    test('private subnet should get vpc id form created vpc', function (done) {
      const { vpc, privateSubnets } = network
      pulumi
        .all([privateSubnets[0].urn, privateSubnets[0].vpcId, vpc.id])
        .apply(([subnetUrn, subnetVpcId, vpcId]) => {
          if (subnetVpcId === vpcId) {
            done()
          } else {
            done(new Error(`Missing a name tag on server ${subnetUrn}`))
          }
        })
    })

    test('private subnet should get cidr correctly', function (done) {
      const { privateSubnets } = network
      pulumi
        .all([privateSubnets[0].urn, privateSubnets[0].cidrBlock])
        .apply(([subnetUrn, subnetCidrBlock]) => {
          if (
            subnetCidrBlock ===
            mockConfig.network.privateSubnetConfig[0].cidrBlock
          ) {
            done()
          } else {
            done(new Error(`Missing a name tag on server ${subnetUrn}`))
          }
        })
    })

    test('private subnet should get tags name correctly', function (done) {
      const { privateSubnets } = network
      pulumi
        .all([privateSubnets[0].urn, privateSubnets[0].tags])
        .apply(([subnetUrn, subnetTags]) => {
          if (
            subnetTags &&
            subnetTags['Name'] ===
              `private-subnet-${mockConfig.network.privateSubnetConfig[0].availability}`
          ) {
            done()
          } else {
            done(new Error(`Missing a name tag on server ${subnetUrn}`))
          }
        })
    })

    test('public subnet should get vpc id form created vpc', function (done) {
      const { vpc, publicSubnets } = network
      pulumi
        .all([publicSubnets[0].urn, publicSubnets[0].vpcId, vpc.id])
        .apply(([subnetUrn, subnetVpcId, vpcId]) => {
          if (subnetVpcId === vpcId) {
            done()
          } else {
            done(new Error(`Missing a name tag on server ${subnetUrn}`))
          }
        })
    })
  })
})
