import { SSMClientInterface } from "@src/core/SSM/SSMClientInterface";

export class DummySSMClient implements SSMClientInterface{
   
    async getOpenAIkey(): Promise<string> {
        return Promise.resolve('dummyOpenAIApiKey')
    }
    async getSlackToken(): Promise<string> {
        return Promise.resolve('dummySlackToken')
    }

}