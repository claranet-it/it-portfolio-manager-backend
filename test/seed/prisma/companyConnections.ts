import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

export async function seedCompanyConnections() {
  const it = await prisma.company.findFirst({ where: { name: 'it' } })
  const us = await prisma.company.findFirst({ where: { name: 'us' } })
  const cnaTest = await prisma.company.findFirst({
    where: { name: 'cna test' },
  })

  await prisma.companyConnections.createMany({
    data: [
      {
        requester_company_id: it!.id,
        correspondent_company_id: us!.id,
      },
      {
        requester_company_id: it!.id,
        correspondent_company_id: cnaTest!.id,
      },
    ],
  })
}
