
import { EffortService } from "@src/core/Effort/service/EffortService"
import { UserProfileService } from "@src/core/User/service/UserProfileService"
import { EffortRepository } from "@src/infrastructure/Effort/repository/EffortRepository"
import { UserProfileRepository } from "@src/infrastructure/User/repository/UserProfileRepository"
import { DynamoDBConnection } from "@src/infrastructure/db/DynamoDBConnection"

const dynamo = DynamoDBConnection.getClient()
const userService = new UserProfileService(new UserProfileRepository(dynamo))
const effortService = new EffortService(new EffortRepository(dynamo, false), userService)

export async function handler() {
    const email = 'george.python@email.com'
    await userService.delete(email)
    await effortService.delete(email)
    return {message: 'done'}
}