import { BusinessCardType, DeleteBusinessCardType } from "../model";

export interface BusinessCardRepositoryInterface {
  save(params: BusinessCardType): Promise<void>
  delete(params: DeleteBusinessCardType): Promise<void>
  get(params: { email: string }): Promise<BusinessCardType>
}
