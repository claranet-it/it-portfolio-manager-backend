import { CurriculumRepositoryInterface } from '../repository'

import {
    CurriculumType,
    CurriculumWithUserEmailType,
    DeleteItemCurriculumType,
    GetCurriculumByEmailType,
} from '../model'

export class CurriculumService {
    constructor(
        private readonly curriculumRepository: CurriculumRepositoryInterface,
    ) { }

    async get(params: GetCurriculumByEmailType): Promise<CurriculumType | null> {
        return await this.curriculumRepository.get(params)
    }

    async save(params: CurriculumWithUserEmailType): Promise<void> {
        if (params.email !== params.userEmail) {
            throw new Error("Can't save curriculum for another user")
        }
        const { userEmail, ...paramsWithoutUserEmail } = params // eslint-disable-line @typescript-eslint/no-unused-vars
        await this.curriculumRepository.save(paramsWithoutUserEmail)
    }

    async deleteWork(params: DeleteItemCurriculumType): Promise<void> {
        await this.curriculumRepository.deleteWork(params)
    }
    async deleteEducation(params: DeleteItemCurriculumType): Promise<void> {
        await this.curriculumRepository.deleteEducation(params)
    }
}
