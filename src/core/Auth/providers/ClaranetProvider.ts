import { ProviderInterface } from './providerInterface'
import { JWT, JwtHeader, TokenOrHeader } from '@fastify/jwt'
import buildGetJwks from 'get-jwks'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'
import { AuthInfoType } from '../model/Auth.model'

export class ClaranetProvider implements ProviderInterface {
  constructor(private jwt: JWT) {}

  async getAuthInfo(token: string): Promise<AuthInfoType> {
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
    const {
      email,
      name,
      picture,
      'https://claranet/company': company,
    } = this.jwt.verify<{
      email: string
      name: string
      picture: string
      'https://claranet/company': string
    }>(token, { key: key })
    if (!email || !name || !picture || !company) {
      throw new UnauthorizedError()
    }

    return {
      email: email.replace(/[a-z]+\.clara\.net/, 'claranet.com').toLowerCase(),
      name,
      picture,
      companyId: company.toLowerCase(),
    }
  }

  private getCompanydomain = (company: string) => {
    switch (company.toLowerCase()) {
      case 'claranet italia':
        return 'it.clara.net'
      case 'claranet france':
        return 'fr.clara.net'
      default:
        console.log(`${company} is not a valid company for Claranet`)
        throw new UnauthorizedError()
    }
  }
}
