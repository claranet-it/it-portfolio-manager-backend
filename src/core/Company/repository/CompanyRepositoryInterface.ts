import { CompanyType } from './model/Company'

export interface CompanyRepositoryInterface {
  findById(id: string): Promise<CompanyType | null>
}
