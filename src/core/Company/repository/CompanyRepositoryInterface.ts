import { CompanyType } from "./model/Company";

export interface CompanyRepositoryInterface{
    findByDomain(domain: string): Promise<CompanyType | null>
}