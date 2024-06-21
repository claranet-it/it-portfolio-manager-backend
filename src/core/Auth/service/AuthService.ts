import { JWT } from '@fastify/jwt'
import { ProviderResolver } from '../providers/providerResolver'
import {
  AuthInfoType,
  Provider,
  verifyJwtParamsType,
} from '../model/Auth.model'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'
import { CompanyRepositoryInterface } from '@src/core/Company/repository/CompanyRepositoryInterface'
import { JwtTokenType } from '@src/core/JwtToken/model/jwtToken.model'

export class AuthService {
  constructor(
    private jwt: JWT,
    private providerResolver: ProviderResolver,
    private companyRepository: CompanyRepositoryInterface,
  ) {}

  async signIn(params: verifyJwtParamsType): Promise<string> {
    const provider = this.providerResolver.resolve(
      Provider[params.provider as keyof typeof Provider],
    )
    let authInfo: AuthInfoType
    try {
      authInfo = await provider.getAuthInfo(params.token)
    } catch (error) {
      console.log(error)
      throw new UnauthorizedError()
    }
    const company = await this.companyRepository.findById(
      authInfo.companyId,
    )
    if (!company) {
      console.warn(`${company} not found`)
      throw new UnauthorizedError()
    }
    const user: JwtTokenType = {
      email: authInfo.email,
      name: authInfo.name,
      picture: authInfo.picture,
      company: company.name,
    }
    return this.jwt.sign(user, { expiresIn: '1d' })
  }
}
