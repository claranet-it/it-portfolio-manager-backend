import { JWT, JwtHeader, TokenOrHeader } from '@fastify/jwt'
import buildGetJwks from 'get-jwks'
import { verifyJwtParamsType } from '../model/Auth.model'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'

export class AuthService {
  constructor(private jwt: JWT) {}

  async signIn(params: verifyJwtParamsType): Promise<string> {
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
    const result = this.jwt.verify<JwtTokenType>(params.token, { key: key })
    const newToken = this.jwt.sign({email: result.email, name: result.name, picture: result.picture})
    return newToken
  }
}
