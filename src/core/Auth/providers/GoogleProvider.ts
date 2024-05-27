import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { ProviderInterface } from './providerInterface'
import { OAuth2Client } from 'google-auth-library'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'

export class GoogleProvider implements ProviderInterface {
  constructor(private gooleAuthClient: OAuth2Client) {}

  async getUser(token: string): Promise<JwtTokenType> {
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
        company: payload.hd
      }
  }
}
