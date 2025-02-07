import { ProviderInterface } from './providerInterface'
import { AuthInfoType } from '../model/Auth.model'
import axios from 'axios'

export class MicrosoftProvider implements ProviderInterface {
  constructor() {}

  async getAuthInfo(token: string): Promise<AuthInfoType> {
    const headers = {
      Authorization: `Bearer ${token}`,
    }

    const [graphResponse, organizationResponse] = await Promise.all([
      axios.get('https://graph.microsoft.com/v1.0/me', { headers }),
      axios.get('https://graph.microsoft.com/v1.0/organization', { headers }),
    ])

    const displayName = graphResponse.data.displayName
    const email = graphResponse.data.mail
    const companyId =
      organizationResponse.data.value[0].displayName.toLowerCase()

    return Promise.resolve({
      email: email,
      name: displayName,
      picture: '',
      companyId: companyId,
    })
  }
}
