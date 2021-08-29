import * as pulumi from '@pulumi/pulumi'
import { Config } from '../../07-msk/config'

export const mockConfig: Config = {
  clusterName: 'mock-cluster',
  stackReference: 'ref',
  brokerInstanceType: 'Kafka.t3.small',
  brokerNumberNode: 3,
  brokerEbsVolumeSize: 1000,
  kafkaVersion: '2.8.0',
  securityGroupName: 'mock-security-group',
  clusterConfigName: 'mock-med4all-msk-cluster-config',
}

// eslint-disable-next-line
export const mockNetwork: any = {
  vpc: {
    id: 'mock-vpc',
  },
  privateSubnets: [{ id: 'subnet-1' }, { id: 'subnet-2' }, { id: 'subnet-3' }],
  publicSubnets: [],
  securityGroup: {
    id: 'global-security-group-1',
  },
}

// eslint-disable-next-line
export const mockClusterConfig: any = {
  clusterConfig: {
    arn: pulumi.output('test'),
    kafkaVersions: pulumi.output(['2.8.0']),
    latestRevision: pulumi.output(1),
    serverProperties: pulumi.output('test'),
    description: pulumi.output('test'),
    id: pulumi.output('test'),
    name: pulumi.output('test'),
    urn: pulumi.output('test'),
  },
}
