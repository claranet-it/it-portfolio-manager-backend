import { FastifyInstance } from 'fastify'
import { test, before, after } from 'tap'
import createApp from '@src/app'
import { PrismaClient } from 'prisma/generated'
import { SkillRepository } from '@src/infrastructure/Skill/Repository/SkillRepository'
import { CompanyService } from '@src/core/Company/service/CompanyService'
import { CompanyRepository } from '@src/infrastructure/Company/Repository/CompanyRepository'
import { CompanyKeysRepository } from '@src/infrastructure/Company/Repository/CompanyKeysRepository'

let app: FastifyInstance
const prisma = new PrismaClient()

let companyService: CompanyService

const MY_COMPANY_ID = "MyCompanyId"
const OTHER_COMPANY_ID = "OtherCompanyId"

before(async () => {
    app = createApp({ logger: false })
    await app.ready()

    const myCompany = await prisma.company.create({
        data: {
            name: 'MyCompany',
            id: MY_COMPANY_ID,
            domain: "MyCompany"
        }
    })

    const otherCompany = await prisma.company.create({
        data: {
            name: 'OtherCompany',
            id: OTHER_COMPANY_ID,
            domain: "OtherCompany"
        },
    })

    await prisma.skill.createMany({
        data: [
            {
                name: 'Skill1',
                service_line: 'Service Line 1',
                company_id: myCompany.id,
                visible: true,
            },
            {
                name: 'Skill2',
                service_line: 'Service Line 1',
                company_id: myCompany.id,
                visible: true,
            },
            {
                name: 'Skill3',
                service_line: 'Service Line 1',
                company_id: otherCompany.id,
                visible: true,
            },
            {
                name: 'Skill4',
                service_line: 'Service Line 1',
                company_id: otherCompany.id,
                visible: true,
            },
        ],
    })

    const companyRepository = new CompanyRepository()
    const skillRepository = new SkillRepository()
    const companyKeysRepository = new CompanyKeysRepository()
    companyService = new CompanyService(companyRepository, companyKeysRepository, skillRepository)
})

after(async () => {
    const deleteSkill = prisma.skill.deleteMany()
    const deleteCompany = prisma.company.deleteMany()

    await prisma.$transaction([
        deleteSkill, deleteCompany,
    ])

    prisma.$disconnect()
    await app.close()
})

test('Delete company and related data', async (t) => {
    await companyService.deleteCompany(MY_COMPANY_ID)
    const responseSkill = await prisma.skill.findMany()
    const responseCompany = await prisma.company.findMany()
    t.equal(responseSkill.length, 2)
    t.equal(responseCompany.length, 1)
})



