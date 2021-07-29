import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'

export interface Route53 {
  certificates: aws.acm.Certificate[]
}

const create = (): Route53 => {
  const certificates = config.default.customDomainName.map((customDomain) =>
    createCertificate(customDomain)
  )

  return {
    certificates,
  }
}

const createCertificate = (domainName: string): aws.acm.Certificate => {
  const route53Zone = pulumi.output(
    aws.route53.getZone({
      name: config.default.route53ZoneName,
    })
  )

  const certificate = new aws.acm.Certificate(
    `${config.default.certification.name}-${domainName}`,
    {
      domainName: domainName,
      validationMethod: config.default.certification.validationMethod,
    }
  )

  const records = certificate.domainValidationOptions.apply(
    (domainValidationOptions) =>
      domainValidationOptions.map(
        (domainValidationOption) =>
          new aws.route53.Record(
            `${config.default.certification.recordName}-${domainValidationOption.resourceRecordName}`,
            {
              allowOverwrite: true,
              name: domainValidationOption.resourceRecordName,
              records: [domainValidationOption.resourceRecordValue],
              ttl: 60,
              type: domainValidationOption.resourceRecordType,
              zoneId: route53Zone.zoneId,
            }
          )
      )
  )

  new aws.acm.CertificateValidation(
    `${config.default.certification.recordValidationName}-${domainName}`,
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: records.apply((record) =>
        record.map((record) => record.fqdn)
      ),
    }
  )

  return certificate
}

export default {
  create,
}
