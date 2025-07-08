import { PrismaClient } from '../../../prisma/generated'

const prisma = new PrismaClient()

  export async function seedEntries(tasks: string[]) {
  for (let i = 0; i < tasks.length; i++) {
    await prisma.timeEntry.createMany({
      data: [
        { email: `nicholas.crow@email.com`, task_id: tasks[i], time_entry_date: new Date(), description: `description ${i}`},
        { email: `nicholas.crow@email.com`, task_id: tasks[i], time_entry_date: new Date(), description: `description ${i}`},
        { email: `nicholas.crow@email.com`, task_id: tasks[i], time_entry_date: new Date(), description: `description ${i}`},
        { email: `nicholas.crow@email.com`, task_id: tasks[i], time_entry_date: new Date(), description: `description ${i}`},
        { email: `nicholas.crow@email.com`, task_id: tasks[i], time_entry_date: new Date(), description: `description ${i}`},
      ],
    })
  }
}