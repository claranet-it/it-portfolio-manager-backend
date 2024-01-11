import {test} from "tap"
import createApp from "@src/app";
import { SkillMatrixList } from "@src/core/SkillMatrix/model/skillMatrixList.model";
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
        name: 'tetsName1',
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
  t.equal(response[0].name, skillMatrixList.getSkillMatrixList()[0].name)
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
        name: 'testName1',
        crew: 'test1',
        skill: 'test skill',
        skillCategory: 'test skill category',
        score: 1,
        updatedAt: '2023-01-01T01:00:00.000Z',
    },
    {
      uid: 'test1@test.it',
      company: 'test1',
      name: 'testName1',
      crew: 'test1',
      skill: 'test skill2',
      skillCategory: 'test skill2 category',
      score: 2,
      updatedAt: '2023-01-01T01:00:00.000Z',
    },
    {
      uid: 'test2@test.it',
      company: 'test1',
      name: 'testName2',
      crew: 'test1',
      skill: 'test skill2',
      skillCategory: 'test skill2 category',
      score: 2,
      updatedAt: '2023-01-01T01:00:00.000Z',
    },
  ])

  const response = skillMatrixList.toSkillMatrixResponse()

  t.equal(response.length, 2)
  t.equal(Object.keys(response[0]).some((key) => key === 'testName2'), false)
  t.equal(Object.keys(response[0]).some((key) => key === 'testName1'), true)
  t.equal(response[0]['testName1'].company, 'test1')
  t.equal(response[0]['testName1'].crew, 'test1')
  t.equal(Object.keys(response[0]['testName1'].skills).length, skillsList.length+2)
  t.equal(Object.keys(response[0]['testName1'].skills).some((skill) => { response[0]['testName1'].skills[skill] === 1 }), false)
  t.equal(response[0]['testName1'].skills['test skill'], 1)
  t.equal(response[0]['testName1'].skills['test skill2'], 2)

  t.equal(Object.keys(response[1]).some((key) => key === 'testName1'), false)
  t.equal(Object.keys(response[1]).some((key) => key === 'testName2'), true)
  t.equal(response[1]['testName2'].company, 'test1')
  t.equal(response[1]['testName2'].crew, 'test1')
  t.equal(Object.keys(response[1]['testName2'].skills).length, skillsList.length+1)
  t.equal(Object.keys(response[1]['testName2'].skills).some((skill) => { response[1]['testName2'].skills[skill] === 1 }), false)
  t.equal(response[1]['testName2'].skills['test skill2'], 2)
})
