import { BusinessCardType } from "../model";

export interface BusinessCardRepositoryInterface {
  save(params: BusinessCardType): Promise<void>
}
