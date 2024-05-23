import { JWT, JwtHeader, TokenOrHeader } from '@fastify/jwt'
import buildGetJwks from 'get-jwks'
import { verifyJwtParamsType } from '../model/Auth.model'

export class AuthService {
  constructor(private jwt: JWT) {}

  async verifyJwt(params: verifyJwtParamsType) {
    const decodedToken = this.jwt.decode<TokenOrHeader>(params.token, {
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
    const result = this.jwt.verify(params.token, { key: key })
    console.log(result)
  }
}
