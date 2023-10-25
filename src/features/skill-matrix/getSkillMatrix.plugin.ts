import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { SkillMatrixQueryParamsType, SkillMatrixReadParamsType, SkillMatrixMineResponseType } from '@models/skillMatrix.model'
import { QueryCommand } from '@aws-sdk/client-dynamodb'
import { JwtTokenType } from '@src/models/jwtToken.model'

declare module 'fastify' {
  interface FastifyInstance {
    getMineSkillMatrix: (jwtToken: JwtTokenType) => Promise<SkillMatrixMineResponseType>,
    getAllSkillMatrix: (params: SkillMatrixReadParamsType) => Promise<SkillMatrixMineResponseType>
  }
}

async function getSkillMatrixPlugin(fastify: FastifyInstance): Promise<void> {
  const getSkillMatrix = async (params: SkillMatrixQueryParamsType): Promise<SkillMatrixMineResponseType> => {
    const command = new QueryCommand({TableName: fastify.getTableName('SkillMatrix')})

    if(params.uid) {
      command.input.KeyConditionExpression = 'uid = :uid'
      command.input.ExpressionAttributeValues = { ':uid': { S: params.uid } }
    } else if(params.company) {
      command.input.IndexName = 'companyIndex'
      command.input.KeyConditionExpression = 'company = :company'
      command.input.ExpressionAttributeValues = { ':company': { S: params.company } }
    }

    const result = await fastify.dynamoDBClient.send(command)

    if (result?.Items) {
      return result.Items.map((item) => ({
        uid: item.uid?.S ?? '',
        company: item.company?.S ?? '',
        crew: item.crew?.S ?? '',
        skill: item.skill?.S ?? '',
        skillCategory: item.skillCategory?.S ?? '',
        score: parseInt(item.score?.N ?? '0'),
        updatedAt: item.updatedAt?.S ?? '',
      }))
    }

    return []
  }
  const getMineSkillMatrix = async (jwtToken: JwtTokenType): Promise<SkillMatrixMineResponseType> => {
    return await getSkillMatrix({ uid: jwtToken.email })
  }
  const getAllSkillMatrix = async (params: SkillMatrixReadParamsType): Promise<SkillMatrixMineResponseType> => {
    return await getSkillMatrix(params)
  }

  fastify.decorate('getMineSkillMatrix', getMineSkillMatrix)
  fastify.decorate('getAllSkillMatrix', getAllSkillMatrix)
}

export default fp(getSkillMatrixPlugin)
