import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { getTableName } from '@src/core/db/TableName'
import { NetworkingRepositoryInterface } from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {CompanySkillType, NetworkingSkillsResponseType, SkillType} from "@src/core/Networking/model/networking.model";


export class NetworkingRepository
  implements NetworkingRepositoryInterface
{
  constructor(private dynamoDBClient: DynamoDBClient) {}
  async getNetworkingAverageSkillsOf(company: string): Promise<NetworkingSkillsResponseType> {
    const skills: CompanySkillType[][] = await this.getSkills(company)
    const groupedSkills = skills.map((s) => this.groupBySkill(s))
    return await this.calculateAverageScore(groupedSkills)
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
  private groupBySkill(array: CompanySkillType[]) {
    const groups: { skill: string; companySkill: CompanySkillType[] }[] = []
    array.forEach(function (groupBy: CompanySkillType) {
      const groupKey = groupBy.skill
      const group = groups.find((g) => g.skill == groupKey)
      if (!group) {
        groups.push({ skill: groupKey, companySkill: [groupBy] })
      } else {
        group.companySkill.push(groupBy)
      }
    })
    return groups
  }

  private async calculateAverageScore(
    groupedSkills: { skill: string; companySkill: CompanySkillType[] }[][],
  ): Promise<NetworkingSkillsResponseType> {
    const results: NetworkingSkillsResponseType = []
    for (const companySkills of groupedSkills) {
      const company = companySkills[0].companySkill[0].company
      const averageSkills: SkillType[] = companySkills.map((c) => {
        const people = c.companySkill.length
        let sum = 0
        for (const skill of c.companySkill) {
          sum = sum + skill.score
        }
        return {
          skill: c.companySkill[0].skill,
          averageScore: people !== 0 ? Math.round(sum / people) : 0,
          people: people,
        }
      })
      results.push({ company, skills: averageSkills })
    }
    return results
  }
}
