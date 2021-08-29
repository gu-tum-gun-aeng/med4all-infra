import * as pulumi from '@pulumi/pulumi'
import { pulumiSetMock } from '../pulumi'
import { mockConfig, mockNetwork, mockClusterConfig } from './mock'
import MskCluster from '../../07-msk/cluster'

pulumiSetMock()

describe('MSK Cluster', () => {
  const {
    cluster: createdMskCluster,
    clusterSecurityGroup: createdClusterSecurityGroup,
  } = MskCluster.create(mockConfig, mockNetwork, mockClusterConfig)

  test('should have a name tag that name mock-cluster', (done) => {
    pulumi
      .all([createdMskCluster.urn, createdMskCluster.tags])
      .apply(([urn, tags]) => {
        if (tags && tags['Name']) {
          expect(tags.Name).toBe('mock-cluster')
          done()
        } else {
          done(new Error(`Missing a name tag on ${urn}`))
        }
      })
  })

  test('should have subnets id list in broker node info', (done) => {
    pulumi
      .all([
        createdMskCluster.urn,
        createdMskCluster.brokerNodeGroupInfo.clientSubnets,
      ])
      .apply(([urn, subnetIds]) => {
        if (subnetIds) {
          expect(subnetIds).toHaveLength(3)
          expect(subnetIds).toEqual(['subnet-1', 'subnet-2', 'subnet-3'])
          done()
        } else {
          done(new Error(`Missing clinet subnets on ${urn}`))
        }
      })
  })

  test('should have subnets id list in broker node info', (done) => {
    pulumi
      .all([
        createdMskCluster.urn,
        createdMskCluster.brokerNodeGroupInfo.securityGroups,
        createdClusterSecurityGroup.id,
      ])
      .apply(([urn, securityGroups, clusterSecurityGroupID]) => {
        if (securityGroups) {
          expect(securityGroups).toHaveLength(1)
          expect(securityGroups).toEqual([clusterSecurityGroupID])
          done()
        } else {
          done(new Error(`Missing clinet subnets on ${urn}`))
        }
      })
  })
})
