import { JwtTokenType } from "@src/core/JwtToken/model/jwtToken.model";

export interface ProviderInterface {
    getUser(token: string): Promise<JwtTokenType>
}