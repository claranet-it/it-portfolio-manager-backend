import { ProviderInterface } from './providerInterface'
import { OAuth2Client } from 'google-auth-library'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'
import { AuthInfoType } from '../model/Auth.model'

export class GoogleProvider implements ProviderInterface {
  constructor(private gooleAuthClient: OAuth2Client) {}

  async getAuthInfo(token: string): Promise<AuthInfoType> {
    const ticket = await this.gooleAuthClient.verifyIdToken({
      idToken: token,
    })
    const payload = ticket.getPayload()
    if (!payload || !payload.email || !payload.name || !payload.hd) {
      throw new UnauthorizedError()
    }
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture ?? '',
      companyDomain: payload.hd,
    }
  }
}
