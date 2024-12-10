import { CompanyFindType, CompanyType } from '@src/core/Company/model/Company'

export interface CompanyRepositoryInterface {
  findById(id: string): Promise<CompanyType | null>
  findOne(find: CompanyFindType): Promise<CompanyType | null>
  findAll(): Promise<CompanyType[]>
  save(company: CompanyType): Promise<CompanyType>
}
