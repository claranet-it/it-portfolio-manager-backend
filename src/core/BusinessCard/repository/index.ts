import {
  BusinessCardType,
  DeleteBusinessCardType,
  GetBusinessCardType,
} from '../model'

export interface BusinessCardRepositoryInterface {
  save(params: BusinessCardType): Promise<void>
  delete(params: DeleteBusinessCardType): Promise<void>
  get(params: GetBusinessCardType): Promise<BusinessCardType | null>
}
