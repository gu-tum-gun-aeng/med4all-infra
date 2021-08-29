import * as aws from '@pulumi/aws'
import { Configuration } from '@pulumi/aws/msk/configuration'
import { Config } from './config'

export interface ClusterConfig {
  clusterConfig: Configuration
}

const create = (config: Config): ClusterConfig => {
  const clusterConfig = new aws.msk.Configuration(config.clusterConfigName, {
    kafkaVersions: [config.kafkaVersion],
    serverProperties: `
            auto.create.topics.enable=true
            default.replication.factor=3
            min.insync.replicas=2
            num.io.threads=8
            num.network.threads=5
            num.partitions=20
            num.replica.fetchers=2
            replica.lag.time.max.ms=30000
            socket.receive.buffer.bytes=102400
            socket.request.max.bytes=104857600
            socket.send.buffer.bytes=102400
            unclean.leader.election.enable=true
            zookeeper.session.timeout.ms=18000
            log.retention.ms=172800000
        `,
  })

  return {
    clusterConfig,
  }
}

export default {
  create,
}
