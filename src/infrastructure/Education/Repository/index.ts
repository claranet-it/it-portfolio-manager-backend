
import { EducationRepositoryInterface } from '@src/core/Education/repository'
import { PrismaClient } from '../../../../prisma/generated'
import { EducationUpdateType } from '@src/core/Education/model'

export class EducationRepository implements EducationRepositoryInterface {

    async updateEducation(id: string, params: EducationUpdateType): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.education.update({
            where: {
                id
            },
            data: {
                note: params.note,
                year_start: params.year_start,
                year_end: params.year_end,
                institution: params.institution,
                current: params.current
            }
        })
    }

    async deleteEducation(id: string): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.education.delete({
            where: {
                id,
            },
        })
    }

}
