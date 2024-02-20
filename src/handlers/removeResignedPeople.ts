
import { EffortService } from "@src/core/Effort/service/EffortService"
import { SkillMatrixService } from "@src/core/SkillMatrix/service/SkillMatrixService"
import { ResignedPeopleService } from "@src/core/User/service/ResignedPeopleService"
import { UserProfileService } from "@src/core/User/service/UserProfileService"
import { EffortRepository } from "@src/infrastructure/Effort/repository/EffortRepository"
import { SkillMatrixRepository } from "@src/infrastructure/SkillMatrix/repository/SkillMatrixRepository"
import { UserProfileRepository } from "@src/infrastructure/User/repository/UserProfileRepository"
import { DynamoDBConnection } from "@src/infrastructure/db/DynamoDBConnection"

const dynamo = DynamoDBConnection.getClient()
const userService = new UserProfileService(new UserProfileRepository(dynamo))
const resignedPeopleService = new ResignedPeopleService(
    userService,
    new EffortService(new EffortRepository(dynamo, false), userService),
    new SkillMatrixService(new SkillMatrixRepository(dynamo), userService)
)

export async function handler() {
    const email = 'george.python@email.com'
    await resignedPeopleService.removeResigned(email)
    return {message: 'done'}
}