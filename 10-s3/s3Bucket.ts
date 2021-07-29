import * as aws from '@pulumi/aws'
import { S3Config } from './config'

export interface S3Bucket {
  bucket: aws.s3.Bucket
}

const create = (config: S3Config): S3Bucket => {
  const bucket = new aws.s3.Bucket(config.bucketName, {
    acl: config.acl,
    bucket: config.bucketName,
  })
  return {
    bucket,
  }
}

export default {
  create,
}
