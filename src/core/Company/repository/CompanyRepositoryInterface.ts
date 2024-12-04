import { CompanyFindType, CompanyType } from './model/Company'

export interface CompanyRepositoryInterface {
  findById(id: string): Promise<CompanyType | null>
  findOne(find: CompanyFindType): Promise<CompanyType | null>
}
