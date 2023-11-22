import { EffortReadParamsType, EffortResponseType } from '../model/effort'
import { EffortRepositoryInterface } from '../repository/EffortRepositoryInterface'

export class EffortService {
  constructor(private effortRepository: EffortRepositoryInterface) {}

  async getEffortFormattedResponse(
    params: EffortReadParamsType,
  ): Promise<EffortResponseType> {
    const efforts = await this.effortRepository.getEffort(params)

    return efforts.toEffortReponse()
  }
}
