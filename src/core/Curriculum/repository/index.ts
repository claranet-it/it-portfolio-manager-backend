import {
    CurriculumType,
    CurriculumUpdateWithUserEmailType,
    GetCurriculumByEmailType,
} from '../model'

export interface CurriculumRepositoryInterface {
    get(params: GetCurriculumByEmailType): Promise<CurriculumType | null>
    create(params: CurriculumType): Promise<void>
    updateCurriculum(params: CurriculumUpdateWithUserEmailType): Promise<void>
}
