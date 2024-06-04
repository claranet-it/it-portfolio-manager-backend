import {DynamoDBClient, QueryCommand} from '@aws-sdk/client-dynamodb'
import {getTableName} from '@src/core/db/TableName'
import {NetworkingRepositoryInterface} from '@src/core/Networking/repository/NetworkingRepositoryInterface'
import {
    CompanyEffortRowType,
    CompanySkillType,
} from "@src/core/Networking/model/networking.model";


export class NetworkingRepository
    implements NetworkingRepositoryInterface {
    constructor(private dynamoDBClient: DynamoDBClient) {
    }

    async getNetworkingSkillsOf(company: string): Promise<CompanySkillType[][]> {
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
                ':company': {S: company},
                ':score': {N: '1'},
            }
            command.input.ExpressionAttributeNames = {
                '#score': 'score',
            }
            command.input.ProjectionExpression = 'company, skill, score, uid'

            const result = await this.dynamoDBClient.send(command)
            if (result?.Items) {
                results.push(
                    result.Items.map((item) => ({
                        company: item.company?.S ?? '',
                        skill: item.skill?.S ?? '',
                        score: parseInt(item.score?.N ?? '0'),
                        uid: item.uid?.S ?? '',
                    })),
                )
            }
        }
        return results
    }

    async getNetworkingEffortOf(uids: string[]): Promise<CompanyEffortRowType[][]> {
        const command = new QueryCommand({
            TableName: getTableName('Effort'),
        })

        const results = []
        for (const uid of uids) {
            command.input.KeyConditionExpression = 'uid = :uid'
            command.input.ExpressionAttributeValues = {':uid': {S: uid}}
            command.input.ProjectionExpression = 'company, uid, month_year, confirmedEffort, tentativeEffort'

            const result = await this.dynamoDBClient.send(command)
            if (result?.Items) {
                results.push(
                    result.Items.map((item) => ({
                        company: item.company?.S ?? '',
                        uid: item.uid?.S ?? '',
                        month_year: item.month_year?.S ?? '',
                        confirmedEffort: item.confirmedEffort.N
                            ? Number(item.confirmedEffort.N)
                            : 0,
                        tentativeEffort: item.tentativeEffort.N
                            ? Number(item.tentativeEffort.N)
                            : 0,
                    }))
                )
            }
        }
        return results
    }

    private getNetworkingOf(company: string): string[] {
        console.log(company) // TODO remove
        return ['it', 'us']
    }
}
