import { BusinessCardRepositoryInterface } from '../repository'
import { BusinessCardType, BusinessCardWithUserEmailType, DeleteBusinessCardType, GetBusinessCardType } from '../model'

export class BusinessCardService {
  constructor(
    private businessCardRepository: BusinessCardRepositoryInterface,
  ) {}

  async save(params: BusinessCardWithUserEmailType): Promise<void> {
    if (params.email !== params.userEmail) {
      throw new Error('Can\'t save business card for another user')
    }
    const { userEmail, ...paramsWithoutUserEmail } = params; // eslint-disable-line @typescript-eslint/no-unused-vars
    await this.businessCardRepository.save(paramsWithoutUserEmail)
  }

  async delete(params: DeleteBusinessCardType): Promise<void> {
    await this.businessCardRepository.delete(params)
  }

  async get(params: GetBusinessCardType): Promise<BusinessCardType | null> {
    return await this.businessCardRepository.get(params)
  }
}
