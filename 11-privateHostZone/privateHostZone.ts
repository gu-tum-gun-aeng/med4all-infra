import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import Config from './config'
import { getArnNlb } from '../05-apigateway/apigateway'
import { ElasticsearchDomain } from '../07-elasticsearch/elasticsearch'
import * as awsSdk from 'aws-sdk'
import { Network } from '../types/network'

export interface PrivateHostZone {
  privateHostZone: aws.route53.Zone
  dashboardRecord: pulumi.Output<aws.route53.Record>[]
  esRecord: aws.route53.Record
}

const create = (
  network: Network,
  elasticsearchDomain: ElasticsearchDomain,
  k8sClusterIdTag: pulumi.Output<string>
): PrivateHostZone => {
  const privateHostZone = createPrivateHostZone(network.vpc)
  const region = pulumi.output(aws.getRegion())
  const localNlbArn = k8sClusterIdTag.apply((id) =>
    pulumi.output(getArnNlb(id))
  )
  const getNlbDns = pulumi
    .all([region, localNlbArn])
    .apply((nlb) => getNlbDnsFn(nlb[0].name, nlb[1] as string))
    .apply((dns) => {
      if (dns) {
        return dns
      } else {
        localNlbArn.apply((arn) =>
          pulumi.log.error(`cannot find nlb with arn: ${arn}`)
        )
        return ''
      }
    })

  const dashboardRecord = Config.dashboardDomainNames.map((domainName) => {
    return getNlbDns.apply((dns) => {
      return new aws.route53.Record(domainName, {
        zoneId: privateHostZone.zoneId,
        name: domainName,
        ttl: Config.route53RecordTtl,
        type: Config.route53RecordType,
        records: [dns],
      })
    })
  })

  const esRecord = new aws.route53.Record(Config.route53EsRecordName, {
    name: Config.route53EsRecordName,
    type: Config.route53RecordType,
    zoneId: privateHostZone.zoneId,
    records: [elasticsearchDomain.elasticsearchDomain.endpoint],
    ttl: Config.route53RecordTtl,
  })

  return {
    privateHostZone,
    dashboardRecord,
    esRecord,
  }
}

const createPrivateHostZone = (vpc: aws.ec2.Vpc) =>
  new aws.route53.Zone(`${Config.privateHostZoneName}`, {
    vpcs: [{ vpcId: vpc.id }],
    name: Config.privateHostZoneName,
  })

const getNlbDnsFn = (regionName: string, arn: string) => {
  const param = {
    LoadBalancerArns: [arn],
  }

  const elbv2 = new awsSdk.ELBv2({
    apiVersion: Config.awsSdkResourceGroupsTaggingApi.apiVersion,
    region: regionName,
  })

  return pulumi.output(
    elbv2
      .describeLoadBalancers(param)
      .promise()
      .then((describeNlb) => describeNlb.LoadBalancers?.[0].DNSName)
  )
}

export default {
  create,
}
