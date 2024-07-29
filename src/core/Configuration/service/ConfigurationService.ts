import {
  getMaximumScore,
  getMinimumScore,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import { ConfigurationType } from '@src/core/Configuration/model/configuration.model'
import { CrewRepositoryInterface } from '../repository/CrewRepositoryInterface'

const serviceLines = ['Developer', 'Cloud']

const skills = {
  [serviceLines[0]]: [
    'PHP',
    'Frontend (JS/TS)',
    'NodeJS (JS/TS)',
    'Native Android',
    'Native iOS',
    'Multiplatform Mobile (ionic, react-native, flutter)',
    'UI Development (HTML/CSS/SCSS)',
    'C#',
    'Python',
    'Java/Kotlin',
    'Elixir',
    'Ruby (Rails)',
    'Rust',
  ].sort(),
  [serviceLines[1]]: [
    'AWS core',
    'AWS migration',
    'AWS monitoring',
    'AWS cloud governance',
    'AWS finance',
    'AWS streaming + IoT',
    'AWS ECS',
    'AWS EKS',
    'AWS Cloudformation',
    'Terraform',
    'Data',
    'Networking',
    'Security',
    'Serverless',
    'ML',
  ].sort(),
}

export const skillsList = skills.Developer.concat(skills.Cloud)

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
