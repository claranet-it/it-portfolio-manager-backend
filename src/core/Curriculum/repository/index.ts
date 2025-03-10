import {
    CurriculumType,
    CurriculumUpdateWithUserEmailType,
    EducationUpdateType,
    GetCurriculumByEmailType,
    WorkUpdateType,
} from '../model'

export interface CurriculumRepositoryInterface {
    get(params: GetCurriculumByEmailType): Promise<CurriculumType | null>
    create(params: CurriculumType): Promise<void>
    deleteEducation(id: string): Promise<void>
    deleteWork(id: string): Promise<void>
    updateCurriculum(params: CurriculumUpdateWithUserEmailType): Promise<void>
    updateEducation(id: string, params: EducationUpdateType): Promise<void>
    updateWork(id: string, params: WorkUpdateType): Promise<void>
}
