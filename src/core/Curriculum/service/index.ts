import { CurriculumRepositoryInterface } from '../repository'

import {
    CurriculumType,
    CurriculumUpdateWithUserEmailType,
    CurriculumWithUserEmailType,
    EducationUpdateType,
    GetCurriculumByEmailType,
    WorkUpdateType,
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

    async deleteWork(id: string): Promise<void> {
        await this.curriculumRepository.deleteWork(id)
    }
    async deleteEducation(id: string): Promise<void> {
        await this.curriculumRepository.deleteEducation(id)
    }

    async updateCurriculum(params: CurriculumUpdateWithUserEmailType): Promise<void> {
        await this.curriculumRepository.updateCurriculum(params)
    }

    async updateEducation(id: string, params: EducationUpdateType): Promise<void> {
        await this.curriculumRepository.updateEducation(id, params)
    }

    async updateWork(id: string, params: WorkUpdateType): Promise<void> {
        await this.curriculumRepository.updateWork(id, params)
    }
}
