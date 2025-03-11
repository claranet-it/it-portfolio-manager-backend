import { WorkRepositoryInterface } from '../repository'

import {
    WorkUpdateType,
} from '../model'

export class WorkService {
    constructor(
        private readonly workRepository: WorkRepositoryInterface,
    ) { }

    async deleteWork(id: string): Promise<void> {
        await this.workRepository.deleteWork(id)
    }

    async updateWork(id: string, params: WorkUpdateType): Promise<void> {
        await this.workRepository.updateWork(id, params)
    }
}
