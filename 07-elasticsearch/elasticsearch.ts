import * as aws from '@pulumi/aws'
import { ElasticsearchConfig } from './config'
import { Network } from '../types/network'

const create = (
  elasticsearchConfig: ElasticsearchConfig,
  network: Network
): ElasticsearchDomain => {
  const elasticsearchDomain = new aws.elasticsearch.Domain(
    elasticsearchConfig.name,
    {
      elasticsearchVersion: '7.10',
      clusterConfig: {
        dedicatedMasterEnabled: true,
        dedicatedMasterCount: 3,
        dedicatedMasterType: elasticsearchConfig.instanceType,
        instanceCount: 3,
        instanceType: elasticsearchConfig.instanceType,

        zoneAwarenessEnabled: true,
        zoneAwarenessConfig: {
          availabilityZoneCount: network.privateSubnets.length,
        },
      },
      ebsOptions: {
        ebsEnabled: true,
        volumeSize: 10,
      },
      vpcOptions: {
        subnetIds: network.privateSubnets.map(
          (privateSubnet) => privateSubnet.id
        ),
        securityGroupIds: [network.securityGroup.id],
      },
      advancedOptions: {
        'rest.action.multi.allow_explicit_index': 'true',
      },
      snapshotOptions: {
        automatedSnapshotStartHour: 23,
      },
      tags: {
        Domain: elasticsearchConfig.name,
      },
    }
  )

  elasticsearchDomain.arn.apply((arn) => {
    new aws.elasticsearch.DomainPolicy('domainPolicy', {
      domainName: elasticsearchDomain.domainName,
      accessPolicies: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: 'es:*',
            Resource: `${arn}/*`,
          },
        ],
      },
    })
  })

  return {
    elasticsearchDomain,
  }
}

export interface ElasticsearchDomain {
  elasticsearchDomain: aws.elasticsearch.Domain
}

export default {
  create,
}
