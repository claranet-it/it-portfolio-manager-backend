import { CurriculumRepositoryInterface } from '@src/core/Curriculum/repository'
import { PrismaClient } from '../../../../prisma/generated'
import { CurriculumType, DeleteItemCurriculumType, GetCurriculumByEmailType } from '@src/core/Curriculum/model'


export class CurriculumRepository implements CurriculumRepositoryInterface {
    async save(params: CurriculumType): Promise<void> {
        const prisma = new PrismaClient()

        const curriculum = await prisma.curriculumVitae.upsert({
            where: {
                email: params.email,
            },
            update: {
                name: params.name,
                role: params.role,
                summary: params.summary,
                main_skills: params.main_skills,
            },
            create: {
                name: params.name,
                email: params.email,
                role: params.role,
                summary: params.summary,
                main_skills: params.main_skills,
            },
        })

        if (curriculum) {
            params.education.forEach(async edu =>
                await prisma.education.create({
                    data: {
                        note: edu.note,
                        year_start: edu.year_start,
                        year_end: edu.year_end,
                        institution: edu.institution,
                        current: edu.current,
                        curriculum_id: curriculum.id
                    }
                })
            )
            params.work.forEach(async wor =>
                await prisma.work.create({
                    data: {
                        note: wor.note,
                        year_start: wor.year_start,
                        year_end: wor.year_end,
                        institution: wor.institution,
                        current: wor.current,
                        role: wor.role,
                        curriculum_id: curriculum.id
                    }
                })
            )
        }
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

    async deleteWork(params: DeleteItemCurriculumType): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.work.delete({
            where: {
                id: params.id,
            },
        })
    }

    async deleteEducation(params: DeleteItemCurriculumType): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.education.delete({
            where: {
                id: params.id,
            },
        })
    }

}
