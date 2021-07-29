import { Config } from '../../07-elasticsearch/config'

export const mockConfig: Config = {
  stackReference: 'ref',
  stackReferenceRoute53: 'route53-ref',
  elasticsearch: {
    name: 'elasticsearch-mock1',
    instanceType: 't3.small.elasticsearch',
    route53RecordPulumiName: 'elasticsearch-name-mock1',
    route53RecordType: 'CNAME',
    route53RecordName: 'mack.kibane',
    route53Ttl: 300,
  },
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
