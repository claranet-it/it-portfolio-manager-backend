import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

export async function seedSkill() {
  const itCompany = await prisma.company.findFirstOrThrow({
    where: { name: 'it' },
  })
  const usCompany = await prisma.company.findFirstOrThrow({
    where: { name: 'us' },
  })

  await prisma.skill.createMany({
    data: [
      {
        name: 'Skill1',
        service_line: 'Service Line 1',
        company_id: itCompany.id,
        visible: true,
      },
      {
        name: 'Skill2',
        service_line: 'Service Line 1',
        company_id: itCompany.id,
        visible: true,
      },
      {
        name: 'Skill3',
        service_line: 'Service Line 1',
        company_id: itCompany.id,
        visible: true,
      },
      {
        name: 'Skill4',
        service_line: 'Service Line 1',
        company_id: usCompany.id,
        visible: true,
      },
    ],
  })
}
