import { accountstatusType } from '../model/slack.model'

export interface SlackRepositoryInterface {
  getAccountStatuses(): Promise<accountstatusType[]>
}
