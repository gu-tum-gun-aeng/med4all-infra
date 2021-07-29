import { Config } from '../../06-msk/config'

export const mockConfig: Config = {
  clusterName: 'mock-cluster',
  stackReference: 'ref',
  brokerInstanceType: 'Kafka.t3.small',
  brokerNumberNode: 3,
  brokerEbsVolumeSize: 1000,
  kafkaVersion: '2.8.0',
  securityGroupName: 'mock-security-group',
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
