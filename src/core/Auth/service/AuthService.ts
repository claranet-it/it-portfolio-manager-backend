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
import { SSMClientInterface } from '@src/core/SSM/SSMClientInterface'
import { DummySSMClient } from '@src/infrastructure/SSM/DummySSMClient'
import { SSMClient } from '@src/infrastructure/SSM/SSMClient'
import { UserProfileRepositoryInterface } from '@src/core/User/repository/UserProfileRepositoryInterface'

export class AuthService {
  constructor(
    private jwt: JWT,
    private providerResolver: ProviderResolver,
    private companyRepository: CompanyRepositoryInterface,
    private userProfileRepository: UserProfileRepositoryInterface,
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
    const company = await this.companyRepository.findById(authInfo.companyId)
    if (!company) {
      console.warn(`Company with id ${authInfo.companyId} not found`)
      throw new UnauthorizedError()
    }
    const role = await this.userProfileRepository.getRole(authInfo.email)

    const user: JwtTokenType = {
      email: authInfo.email,
      name: authInfo.name,
      picture: authInfo.picture,
      company: company.name,
      role: role,
    }
    return this.jwt.sign(user, { expiresIn: '1d' })
  }

  async checkApiKey(header: { apiKey: string }) {
    if (!header.apiKey) {
      throw new UnauthorizedError()
    }

    const isTest = process.env.STAGE_NAME === 'test'
    const ssmClient: SSMClientInterface =
      isTest || process.env.IS_OFFLINE ? new DummySSMClient() : new SSMClient()

    const storedApiKey = await ssmClient.getBricklyApiKey()

    if (header.apiKey !== storedApiKey) {
      throw new UnauthorizedError()
    }
  }
}
