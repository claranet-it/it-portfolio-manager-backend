import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'
import { ProviderInterface } from './providerInterface'
import { JWT, JwtHeader, TokenOrHeader } from '@fastify/jwt'
import buildGetJwks from 'get-jwks'

export class ClaranetProvider implements ProviderInterface {
  constructor(private jwt: JWT) {}

  async getUser(token: string): Promise<JwtTokenType> {
    const decodedToken = this.jwt.decode<TokenOrHeader>(token, {
      complete: true,
    })
    if (!decodedToken) {
      throw new Error('aaaa')
    }
    const getJwks = buildGetJwks()
    const jwtHeader: JwtHeader =
      'header' in decodedToken ? decodedToken.header : decodedToken
    const { kid, alg } = jwtHeader
    const iss = 'payload' in decodedToken ? decodedToken.payload.iss : ''
    const key = await getJwks.getPublicKey({ kid, alg, domain: iss })
    return this.jwt.verify<JwtTokenType>(token, { key: key })
  }
}
