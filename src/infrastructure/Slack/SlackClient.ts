import { WebClient } from "@slack/web-api"

export class SlackClient{
    static async getclient(){
        return new WebClient();
    }
}