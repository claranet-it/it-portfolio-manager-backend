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
    if (!payload || !payload.email || !payload.name) {
      throw new UnauthorizedError()
    }
    if (payload.hd) {
      return {
        email: payload.email.replace('it.clara.net', 'claranet.com').toLowerCase(),
        name: payload.name,
        picture: payload.picture ?? '',
        companyDomain: payload.hd,
      }
    } else {
      return {
        email: payload.email.toLowerCase(),
        name: payload.name,
        picture: payload.picture ?? '',
        companyDomain: 'flowing.it', //demo purpose
      }
    }
  }
}
