import * as pulumi from '@pulumi/pulumi'
import Rds from '../../09-rds/rds'
import Network from '../../01-network/network'
import { mockConfig as rdsMockConfig } from './mock'
import { mockConfig as networkMockConfig } from '../network/mock'
import { pulumiSetMock } from '../pulumi'

pulumiSetMock()

describe('RDS', () => {
  const networkInstance = Network.create(networkMockConfig)
  const rdsInstance = Rds.create(rdsMockConfig, networkInstance)

  describe('Cluster', () => {
    test('should get availability zones correctly', (done) => {
      const { cluster } = rdsInstance
      pulumi
        .all([cluster.urn, cluster.availabilityZones])
        .apply(([urn, availabilityZones]) => {
          if (
            availabilityZones &&
            availabilityZones.length ===
              networkMockConfig.network.privateSubnetConfig.length
          ) {
            expect(availabilityZones[0]).toBe('ap-southeast-1a')
            expect(availabilityZones[1]).toBe('ap-southeast-1b')
            expect(availabilityZones[2]).toBe('ap-southeast-1c')
            done()
          } else {
            done(new Error(`Missing availabilityZones on rds cluster ${urn}`))
          }
        })
    })

    test('should get dbSubnetGroupName correctly', (done) => {
      const { cluster } = rdsInstance
      pulumi
        .all([cluster.urn, cluster.dbSubnetGroupName])
        .apply(([urn, dbSubnetGroupName]) => {
          if (dbSubnetGroupName) {
            expect(dbSubnetGroupName).toBe(rdsMockConfig.rds.subnetGroupName)
            done()
          } else {
            done(new Error(`Missing dbSubnetGroupName on rds cluster ${urn}`))
          }
        })
    })
  })

  describe('Cluster Instance', () => {
    test('should get clusterIdentifier with cluster id correctly', (done) => {
      const { clusterInstances, cluster } = rdsInstance
      pulumi
        .all([
          clusterInstances[0].urn,
          clusterInstances[0].clusterIdentifier,
          cluster.id,
        ])
        .apply(([urn, clusterInstanceClusterId, clusterId]) => {
          if (clusterInstanceClusterId && clusterId) {
            expect(clusterInstanceClusterId).toBe(clusterId)
            done()
          } else {
            done(
              new Error(
                `Missing clusterInstanceClusterId or clusterId on rds cluster instance ${urn}`
              )
            )
          }
        })
    })

    test('should get dbSubnetGroupName correctly', (done) => {
      const { clusterInstances } = rdsInstance
      pulumi
        .all([clusterInstances[0].urn, clusterInstances[0].dbSubnetGroupName])
        .apply(([urn, dbSubnetGroupName]) => {
          if (dbSubnetGroupName) {
            expect(dbSubnetGroupName).toBe(rdsMockConfig.rds.subnetGroupName)
            done()
          } else {
            done(
              new Error(
                `Missing dbSubnetGroupName on rds cluster instance ${urn}`
              )
            )
          }
        })
    })
  })
})
