import { ProjectRowType } from "../model/project.model";

export interface ProjectRepositoryInterface {
    getByCompany(company :string): Promise<ProjectRowType[]>
}