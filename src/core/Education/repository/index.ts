import {
    EducationUpdateType,
} from '../model'

export interface EducationRepositoryInterface {
    deleteEducation(id: string): Promise<void>
    updateEducation(id: string, params: EducationUpdateType): Promise<void>
}
