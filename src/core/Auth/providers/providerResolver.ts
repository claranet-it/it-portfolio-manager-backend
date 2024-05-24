import { AwilixContainer } from 'awilix'
import { Provider } from '../model/Auth.model'
import { ProviderInterface } from './providerInterface'

export class ProviderResolver {
  constructor(private container: AwilixContainer) {}

  resolve(provider: Provider): ProviderInterface {
    switch (provider) {
      case Provider.Claranet:
        return this.container.resolve('claranetProvider')
      case Provider.Google:
        return this.container.resolve('googleProvider')
      default:
        throw new Error('unknown provider')
    }
  }
}
