import {
  CompanyFindType,
  CompanyType,
  CompanyWithSkillsType,
} from '@src/core/Company/model/Company'

export interface CompanyRepositoryInterface {
  findById(
    id: string,
    joinSkills?: boolean,
  ): Promise<CompanyType | CompanyWithSkillsType | null>
  findOne(
    find: CompanyFindType,
    includeSkills?: boolean,
  ): Promise<CompanyWithSkillsType | null>
  findAll(
    idToExclude?: string,
    excludeConnectedCompanies?: boolean,
    excludeUnconnectedCompanies?: boolean,
  ): Promise<CompanyType[]>
  save(company: CompanyType): Promise<CompanyType>
  deleteCompany(idCompany: string): Promise<void>
}
