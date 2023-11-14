import {test} from "tap"
import createApp from "@src/app";
import { SkillMatrixList } from "@src/models/skillMatrixList.model";
import { skillsList } from "@src/core/Configuration/service/ConfigurationService";

test('skillMatrixList toSkilMatrixMineResponse', async t => {
  const app = createApp({
    logger: false,
  })

  t.teardown(() => {
    app.close();
  })

  const skillMatrixList = new SkillMatrixList([
    {
        uid: 'test1@test.it',
        company: 'test1',
        crew: 'test1',
        skill: 'test skill',
        skillCategory: 'test skill category',
        score: 1,
        updatedAt: '2023-01-01T01:00:00.000Z',
    }
  ])

  const response = skillMatrixList.toSkilMatrixMineResponse()
  
  t.equal(response.length, skillMatrixList.getSkillMatrixList().length)
  t.equal(response[0].uid, skillMatrixList.getSkillMatrixList()[0].uid)
  t.equal(response[0].company, skillMatrixList.getSkillMatrixList()[0].company)
  t.equal(response[0].crew, skillMatrixList.getSkillMatrixList()[0].crew)
  t.equal(response[0].skill, skillMatrixList.getSkillMatrixList()[0].skill)
  t.equal(response[0].skillCategory, skillMatrixList.getSkillMatrixList()[0].skillCategory)
  t.equal(response[0].score, skillMatrixList.getSkillMatrixList()[0].score)
  t.equal(response[0].updatedAt, skillMatrixList.getSkillMatrixList()[0].updatedAt)
})

test('skillMatrixList toSkillMatrixResponse', async t => {
  const app = createApp({
    logger: false,
  })

  t.teardown(() => {
    app.close();
  })

  const skillMatrixList = new SkillMatrixList([
    {
        uid: 'test1@test.it',
        company: 'test1',
        crew: 'test1',
        skill: 'test skill',
        skillCategory: 'test skill category',
        score: 1,
        updatedAt: '2023-01-01T01:00:00.000Z',
    },
    {
      uid: 'test1@test.it',
      company: 'test1',
      crew: 'test1',
      skill: 'test skill2',
      skillCategory: 'test skill2 category',
      score: 2,
      updatedAt: '2023-01-01T01:00:00.000Z',
    },
    {
      uid: 'test2@test.it',
      company: 'test1',
      crew: 'test1',
      skill: 'test skill2',
      skillCategory: 'test skill2 category',
      score: 2,
      updatedAt: '2023-01-01T01:00:00.000Z',
    },
  ])

  const response = skillMatrixList.toSkillMatrixResponse()

  t.equal(response.length, 2)
  t.equal(Object.keys(response[0]).some((key) => key === 'test2@test.it'), false)
  t.equal(Object.keys(response[0]).some((key) => key === 'test1@test.it'), true)
  t.equal(response[0]['test1@test.it'].company, 'test1')
  t.equal(response[0]['test1@test.it'].crew, 'test1')
  t.equal(Object.keys(response[0]['test1@test.it'].skills).length, skillsList.length+2)
  t.equal(Object.keys(response[0]['test1@test.it'].skills).some((skill) => { response[0]['test1@test.it'].skills[skill] === 1 }), false)
  t.equal(response[0]['test1@test.it'].skills['test skill'], 1)
  t.equal(response[0]['test1@test.it'].skills['test skill2'], 2)

  t.equal(Object.keys(response[1]).some((key) => key === 'test1@test.it'), false)
  t.equal(Object.keys(response[1]).some((key) => key === 'test2@test.it'), true)
  t.equal(response[1]['test2@test.it'].company, 'test1')
  t.equal(response[1]['test2@test.it'].crew, 'test1')
  t.equal(Object.keys(response[1]['test2@test.it'].skills).length, skillsList.length+1)
  t.equal(Object.keys(response[1]['test2@test.it'].skills).some((skill) => { response[1]['test2@test.it'].skills[skill] === 1 }), false)
  t.equal(response[1]['test2@test.it'].skills['test skill2'], 2)
})
