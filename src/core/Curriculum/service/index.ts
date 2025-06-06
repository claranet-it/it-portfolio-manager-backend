import { CurriculumRepositoryInterface } from '../repository'

import {
    CurriculumType,
    CurriculumUpdateWithUserEmailType,
    CurriculumWithUserEmailType,
    GetCurriculumByEmailType,
} from '../model'

export class CurriculumService {
    constructor(
        private readonly curriculumRepository: CurriculumRepositoryInterface,
    ) { }

    async get(params: GetCurriculumByEmailType): Promise<CurriculumType | null> {
        return await this.curriculumRepository.get(params)
    }

    async create(params: CurriculumWithUserEmailType): Promise<void> {
        if (params.email !== params.userEmail) {
            throw new Error("Can't save curriculum for another user")
        }
        const { userEmail, ...paramsWithoutUserEmail } = params // eslint-disable-line @typescript-eslint/no-unused-vars
        await this.curriculumRepository.create(paramsWithoutUserEmail)
    }

    async updateCurriculum(params: CurriculumUpdateWithUserEmailType): Promise<void> {
        await this.curriculumRepository.updateCurriculum(params)
    }

}
