import { WorkUpdateType } from '@src/core/Work/model'
import { PrismaClient } from '../../../../prisma/generated'
import { WorkRepositoryInterface } from '@src/core/Work/repository'


export class WorkRepository implements WorkRepositoryInterface {

    async updateWork(id: string, params: WorkUpdateType): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.work.update({
            where: {
                id
            },
            data: {
                note: params.note,
                role: params.role,
                year_start: params.year_start,
                year_end: params.year_end,
                institution: params.institution,
                current: params.current
            }
        })
    }

    async deleteWork(id: string): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.work.delete({
            where: {
                id,
            },
        })
    }
}
