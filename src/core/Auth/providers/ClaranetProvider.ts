import { ProviderInterface } from './providerInterface'
import { JWT, JwtHeader, TokenOrHeader } from '@fastify/jwt'
import buildGetJwks from 'get-jwks'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'
import { AuthInfoType } from '../model/Auth.model'

export class ClaranetProvider implements ProviderInterface {
  constructor(private jwt: JWT) {}

  async gatAuthInfo(token: string): Promise<AuthInfoType> {
    const decodedToken = this.jwt.decode<TokenOrHeader>(token, {
      complete: true,
    })
    if (!decodedToken) {
      throw new UnauthorizedError()
    }
    const getJwks = buildGetJwks()
    const jwtHeader: JwtHeader =
      'header' in decodedToken ? decodedToken.header : decodedToken
    const { kid, alg } = jwtHeader
    const iss = 'payload' in decodedToken ? decodedToken.payload.iss : ''
    const key = await getJwks.getPublicKey({ kid, alg, domain: iss })
    const { email, name, picture } = this.jwt.verify<{
      email: string
      name: string
      picture: string
    }>(token, { key: key })
    if (!email || !name || !picture) {
      throw new UnauthorizedError()
    }
    return {
      email,
      name,
      picture,
      companyDomain: 'it.clara.net',
    }
  }
}
