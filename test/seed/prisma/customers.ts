import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

export async function seedCustomers() {
  await prisma.customer.createMany({
    data: [
      {
        name: 'Customer 1',
        company_id: 'it',
      },
      {
        name: 'Customer 2',
        company_id: 'it',
      },
      {
        name: 'Customer 3',
        company_id: 'it',
      },
      {
        name: 'Customer 4',
        company_id: 'it',
      },
      {
        name: 'Customer 5',
        company_id: 'it',
      },
      {
        name: 'Customer 6',
        company_id: 'us',
      },
      {
        name: 'Customer 7',
        company_id: 'us',
      },
      {
        name: 'Customer 8',
        company_id: 'us',
      },
      {
        name: 'Customer 9',
        company_id: 'us',
      },
      {
        name: 'Customer 10',
        company_id: 'us',
      },
    ]
  })
}