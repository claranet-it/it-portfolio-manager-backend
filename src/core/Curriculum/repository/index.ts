import {
    CurriculumType,
    DeleteItemCurriculumType,
    GetCurriculumByEmailType,
} from '../model'

export interface CurriculumRepositoryInterface {
    get(params: GetCurriculumByEmailType): Promise<CurriculumType | null>
    save(params: CurriculumType): Promise<void>
    deleteEducation(params: DeleteItemCurriculumType): Promise<void>
    deleteWork(params: DeleteItemCurriculumType): Promise<void>
}
