import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { ConfigurationType } from '@models/configuration.model'
import { getMaximumScore, getMinimumScore } from '@src/models/skillMatrix.model'

declare module 'fastify' {
  interface FastifyInstance {
    getAllConfiguration: () => ConfigurationType
  }
}

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
    'Data',
    'Networking',
    'Container',
    'Security',
    'Serverless',
    'IaC'
  ],
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
