import { JwtTokenType } from "@src/core/JwtToken/model/jwtToken.model";
import { ProviderInterface } from "./providerInterface";
import {OAuth2Client} from 'google-auth-library';

export class GoogleProvider implements ProviderInterface{
    constructor(private gooleAuthClient: OAuth2Client){}
    
    async getUser(token: string): Promise<JwtTokenType> {
        const tt = await this.gooleAuthClient.getToken(token)
        console.log(tt)
       /*  const tiket = await this.gooleAuthClient.verifyIdToken({
            idToken: token,
            audience: this.clientId
        })
        console.log(tiket.getPayload()) */
        return {email: 'pippo', name: 'pluto', picture: 'picture'}
    }
    
}