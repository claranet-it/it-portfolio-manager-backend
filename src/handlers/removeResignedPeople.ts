
import { EffortService } from "@src/core/Effort/service/EffortService"
import { SkillMatrixService } from "@src/core/SkillMatrix/service/SkillMatrixService"
import { UserProfileService } from "@src/core/User/service/UserProfileService"
import { EffortRepository } from "@src/infrastructure/Effort/repository/EffortRepository"
import { SkillMatrixRepository } from "@src/infrastructure/SkillMatrix/repository/SkillMatrixRepository"
import { UserProfileRepository } from "@src/infrastructure/User/repository/UserProfileRepository"
import { DynamoDBConnection } from "@src/infrastructure/db/DynamoDBConnection"

const dynamo = DynamoDBConnection.getClient()
const userService = new UserProfileService(new UserProfileRepository(dynamo))
const effortService = new EffortService(new EffortRepository(dynamo, false), userService)
const skillMatrixService = new SkillMatrixService(new SkillMatrixRepository(dynamo), userService)

export async function handler() {
    const email = 'george.python@email.com'
    await userService.delete(email)
    await effortService.delete(email)
    await skillMatrixService.delete(email)
    return {message: 'done'}
}