import { JWT} from '@fastify/jwt'
import { ProviderResolver } from '../providers/providerResolver'
import { Provider, verifyJwtParamsType } from '../model/Auth.model'
import { UnauthorizedError } from '@src/core/customExceptions/UnauthorizedError'

export class AuthService {
  constructor(private jwt: JWT, private providerResolver: ProviderResolver) {}

  async signIn(params: verifyJwtParamsType): Promise<string> {
    const provider = this.providerResolver.resolve(Provider[params.provider as keyof typeof Provider])
    try{
    const user = await provider.getUser(params.token)
    return this.jwt.sign({user})    
    }
    catch{
      throw new UnauthorizedError()
    }
  }
}
