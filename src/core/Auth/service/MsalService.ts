import { ConfidentialClientApplication } from '@azure/msal-node'

export class MsalService {
  constructor(private msalClient: ConfidentialClientApplication) {}

  async generateRedirectUrl(state: string): Promise<string> {
    return await this.msalClient.getAuthCodeUrl({
      scopes: ['User.Read'],
      redirectUri: process.env.MSAL_CALLBACK_URL!,
      state: state,
    })
  }
}
