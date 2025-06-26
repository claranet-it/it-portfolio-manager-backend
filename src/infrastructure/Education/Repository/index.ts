import { EducationRepositoryInterface } from '@src/core/Education/repository'
import { EducationUpdateType, EducationCreateWithUserEmailType } from '@src/core/Education/model'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'

export class EducationRepository implements EducationRepositoryInterface {
    constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

    async addEducation(params: EducationCreateWithUserEmailType): Promise<void> {
        const curriculum = await this.prismaDBConnection.getClient().curriculumVitae.findUnique({
            where: {
                email: params.userEmail,
            },
        })

        if (!curriculum) {
            return
        }

        await this.prismaDBConnection.getClient().education.create({
            data: {
                note: params.note,
                year_start: params.year_start,
                year_end: params.year_end,
                institution: params.institution,
                current: params.current,
                curriculum_id: curriculum.id
            }
        })

    }

    async updateEducation(id: string, params: EducationUpdateType): Promise<void> {
        await this.prismaDBConnection.getClient().education.update({
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
        await this.prismaDBConnection.getClient().education.delete({
            where: {
                id,
            },
        })
    }

}
