import { CurriculumRepositoryInterface } from '@src/core/Curriculum/repository'
import { PrismaClient } from '../../../../prisma/generated'
import { CurriculumType, GetCurriculumByEmailType } from '@src/core/Curriculum/model'


export class CurriculumRepository implements CurriculumRepositoryInterface {

    async create(params: CurriculumType): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.curriculumVitae.create({
            data: {
                name: params.name,
                email: params.email,
                role: params.role,
                summary: params.summary,
                main_skills: params.main_skills,
                work: { createMany: { data: params.work } },
                education: { createMany: { data: params.education } }
            }
        })
    }

    async get(params: GetCurriculumByEmailType): Promise<CurriculumType | null> {
        const prisma = new PrismaClient()

        const curriculum = await prisma.curriculumVitae.findUnique({
            where: {
                email: params.email,
            },
            include: {
                education: true,
                work: true,
            },
        })

        if (!curriculum) {
            return null
        }

        return {
            name: curriculum.name,
            email: curriculum.email,
            role: curriculum.role,
            summary: curriculum.summary ?? undefined,
            main_skills: curriculum.main_skills ?? undefined,
            education: curriculum.education,
            work: curriculum.work,
        }
    }

    /* PASSA SOLO GLI ID */
    async deleteWork(id: string): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.work.delete({
            where: {
                id,
            },
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
