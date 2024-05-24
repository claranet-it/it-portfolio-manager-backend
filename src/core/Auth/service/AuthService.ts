import { JWT} from '@fastify/jwt'
import { Provider, verifyJwtParamsType } from '../model/auth.model'
import { ProviderResolver } from '../providers/providerResolver'

export class AuthService {
  constructor(private jwt: JWT, private providerResolver: ProviderResolver) {}

  async signIn(params: verifyJwtParamsType): Promise<string> {
    const provider = this.providerResolver.resolve(Provider[params.provider as keyof typeof Provider])
    const user = await provider.getUser(params.token)
    return this.jwt.sign({email: user.email, name: user.name, picture: user.picture})    
  }
}
