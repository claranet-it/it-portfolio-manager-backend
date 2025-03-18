import {
    EducationUpdateType,
    EducationCreateWithUserEmailType,
} from '../model'

export interface EducationRepositoryInterface {
    deleteEducation(id: string): Promise<void>
    updateEducation(id: string, params: EducationUpdateType): Promise<void>
    addEducation(params: EducationCreateWithUserEmailType): Promise<void>
}
