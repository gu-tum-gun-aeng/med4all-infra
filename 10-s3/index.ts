import Config from './config'
import s3Bucket from './s3Bucket'

const bucket = s3Bucket.create(Config)

export { bucket }
