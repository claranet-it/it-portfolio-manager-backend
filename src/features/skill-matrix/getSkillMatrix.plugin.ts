import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import {
  SkillMatrixQueryParamsType,
  SkillMatrixReadParamsType,
  SkillMatrixMineResponseType,
  SkillMatrixResponseType,
} from '@models/skillMatrix.model'
import { QueryCommand } from '@aws-sdk/client-dynamodb'
import { JwtTokenType } from '@src/models/jwtToken.model'
import { SkillMatrixList } from '@src/models/skillMatrixList.model'

declare module 'fastify' {
  interface FastifyInstance {
    getMineSkillMatrixFormattedReponse: (
      jwtToken: JwtTokenType,
    ) => Promise<SkillMatrixMineResponseType>
    getAllSkillMatrixFormattedResponse: (
      params: SkillMatrixReadParamsType,
    ) => Promise<SkillMatrixResponseType>
  }
}

async function getSkillMatrixPlugin(fastify: FastifyInstance): Promise<void> {
  const getSkillMatrix = async (
    params: SkillMatrixQueryParamsType,
  ): Promise<SkillMatrixList> => {
    const command = new QueryCommand({
      TableName: fastify.getTableName('SkillMatrix'),
    })

    if (params.uid) {
      command.input.KeyConditionExpression = 'uid = :uid'
      command.input.ExpressionAttributeValues = { ':uid': { S: params.uid } }
    } else if (params.company) {
      command.input.IndexName = 'companyIndex'
      command.input.KeyConditionExpression = 'company = :company'
      command.input.ExpressionAttributeValues = {
        ':company': { S: params.company },
      }
    }

    const result = await fastify.dynamoDBClient.send(command)

    if (result?.Items) {
      return new SkillMatrixList(
        result.Items.map((item) => ({
          uid: item.uid?.S ?? '',
          company: item.company?.S ?? '',
          crew: item.crew?.S ?? '',
          skill: item.skill?.S ?? '',
          skillCategory: item.skillCategory?.S ?? '',
          score: parseInt(item.score?.N ?? '0'),
          updatedAt: item.updatedAt?.S ?? '',
        })),
      )
    }

    return new SkillMatrixList([])
  }
  const getMineSkillMatrixFormattedReponse = async (
    jwtToken: JwtTokenType,
  ): Promise<SkillMatrixMineResponseType> => {
    const skillMatrixList = await getSkillMatrix({ uid: jwtToken.email })
    return skillMatrixList.toSkilMatrixMineResponse()
  }
  const getAllSkillMatrixFormattedResponse = async (
    params: SkillMatrixReadParamsType,
  ): Promise<SkillMatrixResponseType> => {
    const skillMatrixList = await getSkillMatrix(params)
    return skillMatrixList.toSkillMatrixResponse()
  }

  fastify.decorate('getMineSkillMatrixFormattedReponse', getMineSkillMatrixFormattedReponse)
  fastify.decorate('getAllSkillMatrixFormattedResponse', getAllSkillMatrixFormattedResponse)
}

export default fp(getSkillMatrixPlugin)
