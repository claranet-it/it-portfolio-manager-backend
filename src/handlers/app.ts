import awsLambdaFastify from '@fastify/aws-lambda'
import createApp from '@src/app'

const app = createApp()

const proxy = awsLambdaFastify(app)

export const handler = proxy
