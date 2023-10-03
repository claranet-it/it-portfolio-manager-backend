import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import process from 'process'

declare module 'fastify' {
  interface FastifyInstance {
    getTableName: (tableName: TableName) => string
  }
}

export type TableName = 'SkillMatrix' | 'UserProfile'

async function getTableNamePlugin(fastify: FastifyInstance): Promise<void> {
  const getTableName = (tableName: TableName): string => {
    const stage = process.env.STAGE_NAME || 'dev'
    return `ItPortfolioManager-${tableName}-${stage}`
  }

  fastify.decorate('getTableName', getTableName)
}

export default fp(getTableNamePlugin)
