import {
  EffortReadParamsType,
  EffortResponseType,
  EffortRowType,
} from '../model/effort'
import { EffortRepositoryInterface } from '../repository/EffortRepositoryInterface'

export class EffortService {
  constructor(private effortRepository: EffortRepositoryInterface) {}

  async getEffortFormattedResponse(
    params: EffortReadParamsType,
  ): Promise<EffortResponseType> {
    const efforts = await this.effortRepository.getEffort(params)

    return efforts.toEffortReponse()
  }

  async saveEffort(params: EffortRowType): Promise<void> {
    await this.effortRepository.saveEffort(params)
  }
}
