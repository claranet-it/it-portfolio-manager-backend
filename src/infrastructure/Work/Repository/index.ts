import { WorkCreateWithUserEmailType, WorkUpdateType } from '@src/core/Work/model'
import { WorkRepositoryInterface } from '@src/core/Work/repository'
import { PrismaDBConnection } from '@src/infrastructure/db/PrismaDBConnection'


export class WorkRepository implements WorkRepositoryInterface {
    constructor(private readonly prismaDBConnection: PrismaDBConnection) {}

    async addWork(params: WorkCreateWithUserEmailType): Promise<void> {
        const curriculum = await this.prismaDBConnection.getClient().curriculumVitae.findUnique({
            where: {
                email: params.userEmail,
            },
        })

        if (!curriculum) {
            return
        }

        await this.prismaDBConnection.getClient().work.create({
            data: {
                note: params.note,
                year_start: params.year_start,
                year_end: params.year_end,
                institution: params.institution,
                current: params.current,
                role: params.role,
                curriculum_id: curriculum.id
            }
        })

    }

    async updateWork(id: string, params: WorkUpdateType): Promise<void> {
        await this.prismaDBConnection.getClient().work.update({
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
        await this.prismaDBConnection.getClient().work.delete({
            where: {
                id,
            },
        })
    }
}
