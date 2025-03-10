import { CurriculumRepositoryInterface } from '@src/core/Curriculum/repository'
import { PrismaClient } from '../../../../prisma/generated'
import { CurriculumType, CurriculumUpdateWithUserEmailType, EducationUpdateType, GetCurriculumByEmailType, WorkUpdateType } from '@src/core/Curriculum/model'


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

    async updateCurriculum(params: CurriculumUpdateWithUserEmailType): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.curriculumVitae.update({
            where: {
                email: params.userEmail
            },
            data: {
                role: params.role,
                summary: params.summary,
                main_skills: params.main_skills,
            }
        })
    }

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
