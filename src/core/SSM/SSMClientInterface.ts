export interface SSMClientInterface{
    getOpenAIkey(): Promise<string>;
    getSlackToken(): Promise<string>;
}