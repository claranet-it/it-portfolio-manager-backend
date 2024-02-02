import {
  getMaximumScore,
  getMinimumScore,
} from '@src/core/SkillMatrix/model/skillMatrix.model'
import { ConfigurationType } from '@src/core/Configuration/model/configuration.model'

const serviceLines = ['Developer', 'Cloud']

const crews = [
  { name: 'Moon', service_line: serviceLines[0] },
  { name: 'Cloud', service_line: serviceLines[1] },
  { name: 'Bees', service_line: serviceLines[0] },
  { name: 'Polaris', service_line: serviceLines[0] },
  { name: 'Rohan', service_line: serviceLines[0] },
  { name: 'Hydra', service_line: serviceLines[1] },
]

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
  getAllConfiguration(): ConfigurationType {
    return {
      crews,
      skills,
      scoreRange,
      scoreRangeLabels,
    }
  }
}
