import { ConfidentialClientApplication } from '@azure/msal-node'

export class MsalService {
  constructor(private msalClient: ConfidentialClientApplication) {}

  async generateRedirectUrl(): Promise<string> {
    return await this.msalClient.getAuthCodeUrl({
      scopes: [],
      redirectUri: process.env.MSAL_CALLBACK_URL!,
    })
  }
}
