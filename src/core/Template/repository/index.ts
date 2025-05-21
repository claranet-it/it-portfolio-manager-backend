import { TemplateCreateParamsWithUserEmailType, TemplateType, TemplateUpdateType } from "../model";

export interface TemplateRepositoryInterface {
    get(email: string): Promise<TemplateType[]>
    save(params: TemplateCreateParamsWithUserEmailType): Promise<void>
    patch(id: string, params: TemplateUpdateType): Promise<void>
    delete(id: string): Promise<void>
}
