import * as pulumi from '@pulumi/pulumi'

import ElasticsearchDomain from '../../08-elasticsearch/elasticsearch'
import { pulumiSetMock } from '../pulumi'
import { mockConfig, mockNetwork } from './mock'

pulumiSetMock()

describe('Elasticsearch', () => {
  const { elasticsearchDomain } = ElasticsearchDomain.create(
    mockConfig.elasticsearch,
    mockNetwork
  )

  describe('Elasticsearch tags', () => {
    test('Elasticsearch tags should be able to get', function (done) {
      pulumi
        .all([elasticsearchDomain.tags, elasticsearchDomain.urn])
        .apply(([tags, urn]) => {
          if (tags && tags['Domain'] === mockConfig.elasticsearch.name) {
            done()
          } else {
            done(new Error(`Missing tags of elasticsearch ${urn}`))
          }
        })
    })
  })

  describe('Elasticsearch availabilityZoneCout', () => {
    test('Elasticsearch availabilityZoneCout should be equal to privateSubnets number', function (done) {
      pulumi
        .all([
          elasticsearchDomain.clusterConfig.zoneAwarenessConfig,
          elasticsearchDomain.urn,
        ])
        .apply(([zoneAwarenessConfig, urn]) => {
          if (zoneAwarenessConfig) {
            expect(zoneAwarenessConfig.availabilityZoneCount).toBe(3)
            done()
          } else {
            done(
              new Error(`Missing availabilityZoneCount of elasticsearch ${urn}`)
            )
          }
        })
    })
  })

  describe('Elasticsearch vpcOption', () => {
    test('Elasticsearch vpcOption subnets number should equal to network privateSubnets', function (done) {
      pulumi
        .all([elasticsearchDomain.vpcOptions, elasticsearchDomain.urn])
        .apply(([vpcOptions, urn]) => {
          if (vpcOptions) {
            expect(vpcOptions.subnetIds).toHaveLength(3)
            expect(vpcOptions.subnetIds).toEqual([
              'subnet-1',
              'subnet-2',
              'subnet-3',
            ])
            done()
          } else {
            done(new Error(`Missing vpcOptions subnet of elasticsearch ${urn}`))
          }
        })
    })
  })
})
