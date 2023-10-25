import {test} from "tap"
import createApp from "@src/app";
import { SkillMatrixList } from "@src/models/skillMatrixList.model";

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
