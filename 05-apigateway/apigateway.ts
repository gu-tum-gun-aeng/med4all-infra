import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import * as awsSdk from 'aws-sdk'
import * as config from './config'
import { Network } from '../types/network'

export interface ApiGateway {
  apiGateway: aws.apigatewayv2.Api
  vpcLink: aws.apigatewayv2.VpcLink
  stage: aws.apigatewayv2.Stage
  integration: aws.apigatewayv2.Integration
  route: aws.apigatewayv2.Route
  customDomains: aws.apigatewayv2.DomainName[]
}

const create = (clusterIdTag: string, network: Network): ApiGateway => {
  const nlbArn = pulumi.output(getArnNlb(clusterIdTag))
  const listenerArn = pulumi.output(
    getListenerArn(nlbArn as pulumi.Output<string>)
  )
  const privateSubnetIds = network.privateSubnets.map((subnet) => subnet.id)
  const vpcLink = createVpcLink(
    [network.vpc.defaultSecurityGroupId],
    privateSubnetIds
  )
  const apiGateway = createApiGateway()
  const integration = createIntegration(apiGateway, listenerArn, vpcLink)
  const route = createRoute(apiGateway, integration)
  const stage = createStage(apiGateway)

  const customDomains = config.default.customDomainName.map((customDomain) =>
    createDomainAndMapPath(customDomain, apiGateway, stage)
  )

  return {
    apiGateway,
    vpcLink,
    stage,
    integration,
    route,
    customDomains,
  }
}

const createStage = (api: aws.apigatewayv2.Api) =>
  new aws.apigatewayv2.Stage(config.default.stage.name, {
    apiId: api.id,
    name: '$default',
    autoDeploy: true,
  })

const createIntegration = (
  api: aws.apigatewayv2.Api,
  listenerArn: pulumi.Output<string>,
  vpcLink: aws.apigatewayv2.VpcLink
) =>
  new aws.apigatewayv2.Integration(config.default.integration.name, {
    apiId: api.id,
    integrationType: config.default.integration.type,
    integrationUri: listenerArn,
    integrationMethod: config.default.integration.integrationHttpMethod,
    connectionType: config.default.integration.connectionType,
    connectionId: vpcLink.id,
  })

const createRoute = (
  api: aws.apigatewayv2.Api,
  integration: aws.apigatewayv2.Integration
) =>
  new aws.apigatewayv2.Route(config.default.route.name, {
    apiId: api.id,
    routeKey: 'ANY /{proxy+}',
    target: pulumi.interpolate`integrations/${integration.id}`,
  })

const createApiGateway = () =>
  new aws.apigatewayv2.Api(config.default.apiGateway.name, {
    protocolType: 'HTTP',
  })

const createVpcLink = (
  securityGroupIds: pulumi.Output<string>[],
  subnetIds: pulumi.Output<string>[]
) =>
  new aws.apigatewayv2.VpcLink(config.default.vpcLink.name, {
    securityGroupIds: securityGroupIds,
    subnetIds: subnetIds,
  })

export const getArnNlb = async (
  clusterIdTag: string
): Promise<pulumi.Output<string>> => {
  const nlbArn = await pulumi
    .output(aws.getRegion())
    .name.apply(async (regionName) => {
      const resourceGroupTaggingApi = new awsSdk.ResourceGroupsTaggingAPI({
        apiVersion: config.default.awsSdkResourceGroupsTaggingApi.apiVersion,
        region: regionName,
      })
      const params = {
        ResourceTypeFilters: [
          config.default.awsSdkResourceGroupsTaggingApi.resourceTypeFilters,
        ],
        TagFilters: [
          {
            Key: clusterIdTag,
            Values: ['owned'],
          },
        ],
      }
      const resourceGroupTagging = await resourceGroupTaggingApi
        .getResources(params)
        .promise()
      try {
        const [resourceTagMapping] =
          resourceGroupTagging.ResourceTagMappingList as awsSdk.ResourceGroupsTaggingAPI.ResourceTagMappingList
        return resourceTagMapping.ResourceARN
      } catch (error) {
        pulumi.log.error(
          `Error resource -> resourceGroupTagging: ${JSON.stringify(
            resourceGroupTagging
          )}`
        )
        throw error
      }
    })

  return nlbArn
}

const getListenerArn = async (
  nlbArn: pulumi.Output<string>
): Promise<pulumi.Output<string>> => {
  return (await pulumi.output(aws.getRegion()).name.apply((regionName) =>
    nlbArn.apply(async (arn) => {
      const params = {
        LoadBalancerArn: arn,
      }
      const elbv2 = new awsSdk.ELBv2({
        apiVersion: config.default.awsSdkResourceGroupsTaggingApi.apiVersion,
        region: regionName,
      })
      const describeListerners = await elbv2.describeListeners(params).promise()
      try {
        const isPort80 = (listener: awsSdk.ELBv2.Listener) =>
          listener.Port === 80
        const [listener] = describeListerners.Listeners?.filter(
          isPort80
        ) as awsSdk.ELBv2.Listeners
        return listener.ListenerArn
      } catch (error) {
        pulumi.log.error(
          `Error resource -> describeListerners: ${JSON.stringify(
            describeListerners
          )}`
        )
        throw error
      }
    })
  )) as pulumi.Output<string>
}

const getCertificate = (
  domainName: string
): pulumi.Output<aws.acm.GetCertificateResult> => {
  const certificateResult = pulumi.output(
    aws.acm.getCertificate({
      domain: domainName,
      mostRecent: true,
      types: [config.default.certificate.type],
    })
  )
  return certificateResult
}

const createDomainAndMapPath = (
  domainName: string,
  api: aws.apigatewayv2.Api,
  stage: aws.apigatewayv2.Stage
): aws.apigatewayv2.DomainName => {
  const certificate = getCertificate(domainName)

  const route53Zone = pulumi.output(
    aws.route53.getZone({
      name: config.default.route53ZoneName,
    })
  )

  const domain = new aws.apigatewayv2.DomainName(
    `${config.default.apiGatewayDomainName.name}-${domainName}`,
    {
      domainName: domainName,
      domainNameConfiguration: {
        certificateArn: certificate.arn,
        endpointType:
          config.default.apiGatewayDomainName.endpointConfigurationType,
        securityPolicy: config.default.apiGatewayDomainName.securityPolicy,
      },
    }
  )

  new aws.apigatewayv2.ApiMapping(
    `${config.default.basePathMapping.name}-${domainName}`,
    {
      apiId: api.id,
      stage: stage.id,
      domainName: domain.domainName,
    }
  )

  new aws.route53.Record(`${config.default.route53Record.name}-${domainName}`, {
    name: domain.domainName,
    type: config.default.route53Record.type,
    zoneId: route53Zone.zoneId,
    ttl: config.default.route53Record.ttl,
    records: [domain.domainNameConfiguration.targetDomainName],
  })

  return domain
}

export default {
  create,
}
