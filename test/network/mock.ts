import { Config } from '../../01-network/config'

export const mockConfig: Config = {
  network: {
    vpc: {
      name: 'vpc-test',
      cidrBlock: '10.0.0.0/16',
    },
    privateSubnetConfig: [
      { availability: 'ap-southeast-1a', cidrBlock: '10.0.1.0/24' },
      { availability: 'ap-southeast-1b', cidrBlock: '10.0.2.0/24' },
      { availability: 'ap-southeast-1c', cidrBlock: '10.0.3.0/24' },
    ],
    publicSubnetConfig: [
      { availability: 'ap-southeast-1a', cidrBlock: '10.0.4.0/24' },
    ],
    elasticIpName: 'elasticIpMock',
  },
  securityGroup: {
    name: 'global-security-group',
  },
}
