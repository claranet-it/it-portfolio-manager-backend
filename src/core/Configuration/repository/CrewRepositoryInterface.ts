import { ConfigurationCrewsType } from "../model/configuration.model";

export interface CrewRepositoryInterface {
    findByCompany(company: string): Promise<ConfigurationCrewsType>
}