import { AwilixContainer } from 'awilix'

import { ProviderInterface } from './providerInterface'
import { Provider } from '../model/Auth.model'

export class ProviderResolver {
  constructor(private container: AwilixContainer) {}

  resolve(provider: Provider): ProviderInterface {
    switch (provider) {
      case Provider.Claranet:
        return this.container.resolve('claranetProvider')
      case Provider.Google:
        return this.container.resolve('googleProvider')
      case Provider.Microsoft:
        return this.container.resolve('microsoftProvider')
      default:
        throw new Error('unknown provider')
    }
  }
}
