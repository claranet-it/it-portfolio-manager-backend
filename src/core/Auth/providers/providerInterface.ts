import { AuthInfoType } from '../model/Auth.model'

export interface ProviderInterface {
  getAuthInfo(token: string): Promise<AuthInfoType>
}
