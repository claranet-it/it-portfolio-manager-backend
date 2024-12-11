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
  findOne(find: CompanyFindType): Promise<CompanyWithSkillsType | null>
  findAll(): Promise<CompanyType[]>
  save(company: CompanyType): Promise<CompanyType>
}
