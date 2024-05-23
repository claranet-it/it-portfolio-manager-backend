import { JWT, JwtHeader, TokenOrHeader } from '@fastify/jwt'
import buildGetJwks from 'get-jwks'

export class AuthService {
  constructor(private jwt: JWT) {}
  async verifyJwt(company: string, token: string) {
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
    const result = this.jwt.verify(token, { key: key })
    console.log(result)
  }
}
