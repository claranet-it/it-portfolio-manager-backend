import { test, before, after } from 'tap'
import createApp from '@src/app'
import { FastifyInstance } from 'fastify'
import { CompanyConnectionsService } from '@src/core/CompanyConnections/service/CompanyConnectionsService'
import { CompanyRepository } from '@src/infrastructure/Company/Repository/CompanyRepository'
import { CompanyConnectionsRepository } from '@src/infrastructure/CompanyConnections/Repository/CompanyConnectionsRepository'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

let app: FastifyInstance
const prisma = new PrismaDBConnection()

const MY_COMPANY_ID = "MyCompanyId"
let companyConnectionsService: CompanyConnectionsService
before(async () => {
    app = createApp({ logger: false })
    await app.ready()
    const myCompany = await prisma.getClient().company.create({
        data: {
            domain: "MyComany",
            name: "MyComany",
            image_url: "sample_image_url",
            id: MY_COMPANY_ID
        },

    })

    const otherCompany = await prisma.getClient().company.create({
        data: {
            domain: "OtherComany",
            name: "OtherComany",
            image_url: "sample_image_url"
        },
    })

    const externalCompany = await prisma.getClient().company.create({
        data: {
            domain: "ExternalComany",
            name: "ExternalComany",
            image_url: "sample_image_url"
        },
    })

    await prisma.getClient().companyConnections.createMany({
        data: [
            {
                requester_company_id: myCompany.id,
                correspondent_company_id: otherCompany.id,
            },
            {
                requester_company_id: externalCompany.id,
                correspondent_company_id: myCompany.id,
            },
            {
                requester_company_id: externalCompany.id,
                correspondent_company_id: otherCompany.id,
            },
        ],
    })

    const companyRepository = new CompanyRepository(prisma)
    const companyConnectionRepository = new CompanyConnectionsRepository(prisma)
    companyConnectionsService = new CompanyConnectionsService(companyRepository, companyConnectionRepository)
})

after(async () => {
    const deleteCompanyConnections = prisma.getClient().companyConnections.deleteMany()
    const deleteCompany = prisma.getClient().company.deleteMany()

    await prisma.getClient().$transaction([deleteCompanyConnections, deleteCompany])
    await prisma.getClient().$disconnect()
    await app.close()
})

test('Remove connection', async (t) => {
    await companyConnectionsService.deleteConnections(MY_COMPANY_ID)
    const responseConnections = await prisma.getClient().companyConnections.findMany()
    t.equal(responseConnections.length, 1)
})