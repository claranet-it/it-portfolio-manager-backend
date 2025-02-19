import { ProviderInterface } from './providerInterface'
import { AuthInfoType } from '../model/Auth.model'
import axios from 'axios'

export class MicrosoftProvider implements ProviderInterface {
  constructor() {}

  async getAuthInfo(token: string): Promise<AuthInfoType> {
    const headers = {
      Authorization: `Bearer ${token}`,
    }

    const graphResponse = await axios.get(
      'https://graph.microsoft.com/v1.0/me',
      { headers },
    )

    const displayName = graphResponse.data.displayName
    const email = graphResponse.data.mail
    const companyId = email.split('@')[1]

    console.log('MSAL LOG - companyId : ' + companyId)

    return {
      email: email,
      name: displayName,
      picture: '',
      companyId: companyId,
    }
  }
}
