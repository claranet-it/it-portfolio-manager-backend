import { EffortService } from '@src/core/Effort/service/EffortService'
import { SkillMatrixService } from '@src/core/SkillMatrix/service/SkillMatrixService'
import { ResignedPeopleService } from '@src/core/User/service/ResignedPeopleService'
import { UserProfileService } from '@src/core/User/service/UserProfileService'
import { EffortRepository } from '@src/infrastructure/Effort/repository/EffortRepository'
import { SkillMatrixRepository } from '@src/infrastructure/SkillMatrix/repository/SkillMatrixRepository'
import { UserProfileRepository } from '@src/infrastructure/User/repository/UserProfileRepository'
import { DynamoDBConnection } from '@src/infrastructure/db/DynamoDBConnection'
import { test, beforeEach } from 'tap'

let service: ResignedPeopleService
let userProfileRepository: UserProfileRepository
let skillMatrixRepository: SkillMatrixRepository
let effortRepository: EffortRepository
const email = 'resigned@email.com'

beforeEach(() => {
  const dynamo = DynamoDBConnection.getClient()
  userProfileRepository = new UserProfileRepository(dynamo)
  const userService = new UserProfileService(userProfileRepository)
  skillMatrixRepository = new SkillMatrixRepository(dynamo)
  effortRepository = new EffortRepository(dynamo, true)
  service = new ResignedPeopleService(
    userService,
    new EffortService(effortRepository, userService),
    new SkillMatrixService(skillMatrixRepository, userService),
  )
})

test('remove user profile', async (t) => {
  await userProfileRepository.saveUserProfile(email, 'resigned', 'it', 'picture-url', {
    crew: 'moon',
    crewLeader: true,
    place: 'Jesi',
    workingExperience: '',
    education: 'University',
    certifications: '',
  })
  await service.removeResigned(email)
  const disabeldProfiles = await userProfileRepository.getDisabled('it')
  t.equal(disabeldProfiles.length, 1)
})

test('remove skill matrix', async (t) => {
  await skillMatrixRepository.save(
    email,
    {
      name: 'resigned',
      crew: 'moon',
      company: 'it',
      crewLeader: true,
      place: '',
      education: '',
      certifications: '',
      workingExperience: '',
    },
    { skill: 'php', score: 3, skillCategory: 'dev' },
  )
  await service.removeResigned(email)
  const skillMatrix =
    await skillMatrixRepository.getMineSkillMatrixFormattedResponse(email)
  t.same(skillMatrix, [])
})

test('remove effort', async (t) => {
  await effortRepository.saveEffort({
    uid: email,
    month_year: '02_24',
    confirmedEffort: 50,
    tentativeEffort: 50,
    notes: 'test',
  })
  await service.removeResigned(email)
  const effort = await effortRepository.getEffort({ uid: email })
  t.same(effort, [])
})
