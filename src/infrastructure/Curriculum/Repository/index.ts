import { CurriculumRepositoryInterface } from '@src/core/Curriculum/repository'
import { CurriculumType, CurriculumUpdateWithUserEmailType, GetCurriculumByEmailType } from '@src/core/Curriculum/model'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'


export class CurriculumRepository implements CurriculumRepositoryInterface {
    constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

    async create(params: CurriculumType): Promise<void> {
        await this.prismaDBConnection.getClient().curriculumVitae.create({
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
        await this.prismaDBConnection.getClient().curriculumVitae.update({
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

    async get(params: GetCurriculumByEmailType): Promise<CurriculumType | null> {
        const curriculum = await this.prismaDBConnection.getClient().curriculumVitae.findUnique({
            where: {
                email: params.email,
            },
            include: {
                education: {
                    orderBy: {
                        year_start: 'desc',
                    },
                },
                work: {
                    orderBy: {
                        year_start: 'desc',
                    },
                },
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

}
