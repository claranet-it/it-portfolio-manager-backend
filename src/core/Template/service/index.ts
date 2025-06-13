import { TemplateCreateParamsWithUserEmailType, TemplateType, TemplateUpdateType } from '../model'
import { TemplateRepositoryInterface } from '../repository'

export class TemplateService {
    constructor(
        private readonly templateRepository: TemplateRepositoryInterface,
    ) { }

    async get(email: string): Promise<TemplateType[]> {
        return await this.templateRepository.get(email)
    }

    async save(params: TemplateCreateParamsWithUserEmailType): Promise<void> {
        return await this.templateRepository.save(params)
    }

    async patch(id: string, params: TemplateUpdateType): Promise<void> {
        return await this.templateRepository.patch(id, params)
    }

    async delete(id: string): Promise<void> {
        return await this.templateRepository.delete(id)
    }

}
