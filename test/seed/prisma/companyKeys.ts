import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

export async function seedCompanyKeys() {
  const company = await prisma.company.findFirst({
    where: {
      name: 'it',
    },
  })
  await prisma.companyKeys.create({
    data: {
      company_id: company?.id ?? 'fake_id',
      encryptedPrivateKey: 'encryptedPrivateKey',
      encryptedAESKey: 'encryptedAESKey',
      publicKey: 'publicKey',
    },
  })
}
