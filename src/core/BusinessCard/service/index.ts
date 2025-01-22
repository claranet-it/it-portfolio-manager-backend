import { BusinessCardRepositoryInterface } from '../repository'
import { BusinessCardWithUserEmailType, DeleteBusinessCardWithUserEmailType } from '../model'

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

  async delete(params: DeleteBusinessCardWithUserEmailType): Promise<void> {
    if (params.email !== params.userEmail) {
      throw new Error('Can\'t delete business card for another user')
    }
    const { userEmail, ...paramsWithoutUserEmail } = params; // eslint-disable-line @typescript-eslint/no-unused-vars
    await this.businessCardRepository.delete(paramsWithoutUserEmail)
  }

}
