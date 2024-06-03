import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'
import { NetworkingRepositoryInterface } from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {
  CompanySkillType,
  NetworkingEffortResponseType,
} from "@src/core/Networking/model/networking.model";


export class NetworkingRepository
  implements NetworkingRepositoryInterface
{
  constructor(private dynamoDBClient: DynamoDBClient) {}
  async getNetworkingAverageSkillsOf(company: string): Promise<CompanySkillType[][]> {
    return await this.getSkills(company)

  }
  async getNetworkingAverageEffortOf(company: string): Promise<NetworkingEffortResponseType> {
    return [{ company, effort: [] }];
  }
  private async getSkills(company: string): Promise<CompanySkillType[][]> {
    const command = new QueryCommand({
      TableName: getTableName('SkillMatrix'),
    })
    // TODO
    const networking = this.getNetworkingOf(company)

    const results = []
    for (const company of networking) {
      command.input.IndexName = 'companyIndex'
      command.input.FilterExpression = '#score >= :score'
      command.input.KeyConditionExpression = 'company = :company'
      command.input.ExpressionAttributeValues = {
        ':company': { S: company },
        ':score': { N: '1' },
      }
      command.input.ExpressionAttributeNames = {
        '#score': 'score',
      }
      command.input.ProjectionExpression = 'company, skill, score'

      const result = await this.dynamoDBClient.send(command)
      if (result?.Items) {
        results.push(
          result.Items.map((item) => ({
            company: item.company?.S ?? '',
            skill: item.skill?.S ?? '',
            score: parseInt(item.score?.N ?? '0'),
          })),
        )
      }
    }
    return results
  }

  private getNetworkingOf(company: string): string[] {
    console.log(company) // TODO remove
    return ['it']
  }
}
