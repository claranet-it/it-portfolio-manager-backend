import {
  getMaximumScore,
  getMinimumScore,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import {
  ConfigurationSkillsType,
  ConfigurationType,
} from '@src/core/Configuration/model/configuration.model'
import { CrewRepositoryInterface } from '../repository/CrewRepositoryInterface'

export const skills: ConfigurationSkillsType = {
  Developer: [
    { name: 'C#', description: '.Net framework, .Net core, ASP.NET' },
    { name: 'Docker', description: 'Containerization platform' },
    { name: 'Elixir', description: 'Functional, concurrent language' },
    {
      name: 'Frontend (JS/TS)',
      description: 'React, Vue, Angular, Next.js, Nuxt',
    },
    {
      name: 'Headless CMS',
      description: 'Content management systems without a front-end',
    },
    { name: 'Java/Kotlin', description: 'Spring, Spring Boot, Quarkus' },
    {
      name: 'Multiplatform Mobile',
      description: 'Ionic, React-native, Flutter',
    },
    {
      name: 'Native Android',
      description: 'Android development with Java/Kotlin',
    },
    { name: 'Native iOS', description: 'Swift' },
    { name: 'NodeJS (JS/TS)', description: 'Fastify, Express, Nestjs' },
    { name: 'NoSQL', description: 'MongoDB, DynamoDB, DocumentsDB' },
    { name: 'PHP', description: 'Symfony, Laravel' },
    { name: 'Python', description: 'Django, Flask, FastAPI' },
    { name: 'Ruby', description: 'Rails' },
    { name: 'Rust', description: 'Systems programming language' },
    { name: 'SQL', description: 'MySQL, PostgreSQL' },
    { name: 'UI Development', description: 'HTML/CSS/SCSS' },
  ],
  Cloud: [
    { name: 'AWS CloudFormation / Azure Resource Manager', description: '' },
    {
      name: 'AWS ECS / Azure Kubernetes Service / Azure Container Instances',
      description: '',
    },
    { name: 'AWS EC2 / Azure Virtual Machines', description: '' },
    { name: 'AWS EKS / Azure Kubernetes Service', description: '' },
    { name: 'AWS Lambda / Azure functions', description: '' },
    {
      name: 'AWS cloud governance / Azure Policy / Azure Blueprints',
      description: '',
    },
    { name: 'AWS core', description: '' },
    { name: 'AWS finance / Azure Policy / Azure Blueprints', description: '' },
    { name: 'AWS migration / Azure Migrate', description: '' },
    { name: 'AWS monitoring / Azure Monitor', description: '' },
    {
      name: 'AWS streaming + IoT / Azure IoT Hub / Azure Stream Analytics / Azure Event Hubs',
      description: '',
    },
    { name: 'Cognito', description: '' },
    { name: 'DB', description: 'Oracle, SQL server, MySQL' },
    { name: 'Data', description: '' },
    { name: 'ML', description: '' },
    { name: 'Networking', description: '' },
    { name: 'Openshift', description: '' },
    { name: 'S3 / Blob', description: '' },
    { name: 'SQS', description: '' },
    { name: 'Security', description: '' },
    { name: 'Serverless', description: '' },
    { name: 'Terraform', description: '' },
    { name: 'VM', description: 'virtual machine' },
  ],
  SoftSkill: [
    { name: 'Agile', description: '' },
    { name: 'Gestione progetto', description: '' },
  ],
  Design: [
    { name: 'Animation', description: '' },
    { name: 'Design systems', description: '' },
    { name: 'Mobile app', description: '' },
    { name: 'Prototyping', description: '' },
    { name: 'User Experience', description: '' },
    { name: 'Ux Writing', description: '' },
    { name: 'Visual', description: '' },
    { name: 'Web app', description: '' },
  ],
}

export const skillsList = skills.Developer.concat(skills.Cloud)
  .concat(skills.SoftSkill)
  .concat(skills.Design)

export const flowingUsers = [
  'stefania.ceccacci@claranet.com',
  'manuel.gherardi@claranet.com',
]

const scoreRange = {
  min: getMinimumScore(),
  max: getMaximumScore(),
}

const scoreRangeLabels = {
  0: 'Niente',
  1: 'Con Affiancamento',
  2: 'Autonomo',
  3: 'Esperto',
}

export class ConfigurationService {
  constructor(private crewRepository: CrewRepositoryInterface) {}
  async getAllConfiguration(company: string): Promise<ConfigurationType> {
    const crews = await this.crewRepository.findByCompany(company)
    return {
      crews,
      skills,
      scoreRange,
      scoreRangeLabels,
    }
  }
}
