import { AuthInfoType } from '../model/Auth.model'

export interface ProviderInterface {
  gatAuthInfo(token: string): Promise<AuthInfoType>
}
