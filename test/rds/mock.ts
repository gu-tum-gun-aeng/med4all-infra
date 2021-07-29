import { Config } from '../../08-rds/config'

export const mockConfig: Config = {
  rds: {
    dbName: 'masterdatabase',
    username: 'med4alladmin',
    password: 'med4allpassword',
    clusterId: 'mock-cluster-id',
    clusterInstanceId: 'mock-cluster-instance-id',
    nCluster: 2,
    skipFinalSnapshot: false,
    subnetGroupName: 'rds-private-subnet',
    instanceType: 'db.t2.micro',
  },
  stackReference: 'med4all/med4all-aws-infrastructure/dev',
}
