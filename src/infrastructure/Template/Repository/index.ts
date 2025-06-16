import { TemplateRepositoryInterface } from '@src/core/Template/repository'
import { PrismaClient } from '../../../../prisma/generated'
import { TemplateCreateParamsWithUserEmailType, TemplateType, TemplateUpdateType } from '@src/core/Template/model'


export class TemplateRepository implements TemplateRepositoryInterface {

    intArrayToString(arr: number[]): string {
        return arr.join(',');
    }

    stringToIntArray(str: string): number[] {
        return str.split(',').map(num => parseInt(num, 10));
    }

    async get(email: string): Promise<TemplateType[]> {
        const prisma = new PrismaClient()

        const result = await prisma.template.findMany({
            where: {
                email: email,
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                task: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },
        })


        return result.map((template) => ({
            id: template.id,
            email: template.email,
            task_id: template.task_id,
            customer_id: template.customer_id,
            project_id: template.project_id,
            timehours: template.timehours,
            daytime: this.stringToIntArray(template.daytime),
            date_start: template.date_start.toISOString().substring(0, 10),
            date_end: template.date_end.toISOString().substring(0, 10),
            customer: template.customer,
            project: template.project,
            task: template.task ?? undefined,
        }))
    }


    async save(params: TemplateCreateParamsWithUserEmailType): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.template.create({
            data: {
                email: params.userEmail,
                task_id: params.task_id,
                customer_id: params.customer_id,
                project_id: params.project_id,
                timehours: params.timehours,
                daytime: this.intArrayToString(params.daytime),
                date_start: new Date(params.date_start),
                date_end: new Date(params.date_end),
            }
        })
    }

    async patch(id: string, params: TemplateUpdateType): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.template.update({
            where: {
                id
            },
            data: {
                timehours: params.timehours,
                daytime: params.daytime && this.intArrayToString(params.daytime),
                date_start: params.date_start && new Date(params.date_start),
                date_end: params.date_end && new Date(params.date_end),
            }
        })
    }

    async delete(id: string): Promise<void> {
        const prisma = new PrismaClient()

        await prisma.template.delete({
            where: {
                id,
            },
        })
    }
}
