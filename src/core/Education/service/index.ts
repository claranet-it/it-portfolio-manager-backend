import { EducationRepositoryInterface } from '../repository'

import {
    EducationUpdateType,
    EducationCreateWithUserEmailType,
} from '../model'

export class EducationService {
    constructor(
        private readonly educationRepository: EducationRepositoryInterface,
    ) { }

    async deleteEducation(id: string): Promise<void> {
        await this.educationRepository.deleteEducation(id)
    }

    async updateEducation(id: string, params: EducationUpdateType): Promise<void> {
        await this.educationRepository.updateEducation(id, params)
    }

    async addEducation(params: EducationCreateWithUserEmailType): Promise<void> {
        await this.educationRepository.addEducation(params)
    }

}
