import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { ConfigurationType } from '@models/configuration.model'
import { getMaximumScore, getMinimumScore } from '@src/models/skillMatrix.model'

declare module 'fastify' {
  interface FastifyInstance {
    getAllConfiguration: () => ConfigurationType
  }
}

const crews = ['Moon', 'Cloud', 'Bees', 'Polaris', 'Rohan', 'Hydra']

const skills = {
  Developer: [
    'PHP - Backend',
    'JavaScript/TypeScript - Frontend',
    'JavaScript/TypeScript - Backend',
    'Native Android',
    'Native iOS',
    'Multiplatform Mobile (ionic, react-native, flutter, etc etc)',
    'UI Development (HTML/CSS/SCSS, etc etc)',
    'C# - Backend',
    'Python - Backend',
    'Java/Kotlin - Backend',
    'Elixir - Backend',
    'Ruby (Rails)',
    'Rust - Backend',
  ],
  Cloud: [
    'Serverless (AWS Lambda, DynamoDB, Step Function...)',
    'Servizi core (IAM, EC2,VPC,RDS,S3, Elasticache)',
    'Servizi Migration (CloudEndure, SMS)',
    'Servizi Data Migration (DMS, DataSync, Transfer Family)',
    'Servizi Serverless (Lambda, APIGW, Step Functions, DynamoDB)',
    'Servizi Data Visualization (QuickSight, ...)',
    'Servizi Data Analytics (Glue, Athena, Redshift, EMR)',
    'Servizi CI/CD (codepipeline, codebuild, codedeploy)',
    'Servizi Security (IAM advanced, KMS, HSM, WAF)',
    'Servizi Networking (VPN, Transit Gateway, VPC Advanced)',
    'Servizi Container Orchestration (ECS, EKS, Kubernetes)',
    'Serverless (Serverless Framework, AWS SAM)',
    'IAC (Terraform, Cloudformation, CDK, Ansible)',
    'Monitoring (Cloudwatch, New Relic, Prometheus, Grafana)',
    'Machine Learning (Amazon Sagemaker, Rekognition, Lex..)',
    'Cloud Governance (Control Tower)',
    'Cloud Finance (Billing e Cost explorer)',
    'Programmazione (Bash, Python)',
    'OS Server (Linux, Windows)',
    'Servizi Data Streaming (Kinesis, MSK, Kafka)',
    'Servizi IoT',
  ],
}

export const skillsList = skills.Developer.concat(skills.Cloud)

const scoreRange = {
  min: getMinimumScore(),
  max: getMaximumScore(),
}

const scoreRangeLabels = {
  0: 'Niente',
  1: 'Poco',
  2: 'Medio',
  3: 'Alto',
}

async function getAllConfigurationPlugin(
  fastify: FastifyInstance,
): Promise<void> {
  const getAllConfiguration = (): ConfigurationType => ({
    crews,
    skills,
    scoreRange,
    scoreRangeLabels,
  })

  fastify.decorate('getAllConfiguration', getAllConfiguration)
}

export default fp(getAllConfigurationPlugin)
