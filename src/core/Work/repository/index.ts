import {
    WorkCreateWithUserEmailType,
    WorkUpdateType,
} from '../model'

export interface WorkRepositoryInterface {
    deleteWork(id: string): Promise<void>
    updateWork(id: string, params: WorkUpdateType): Promise<void>
    addWork(params: WorkCreateWithUserEmailType): Promise<void>
}
