
import { SESv2Client } from "@aws-sdk/client-sesv2"

export class SesConnection {
    static getClient(): SESv2Client {

        let sesClientOptions = {}
        if (process.env.IS_OFFLINE) {
            sesClientOptions = {
                region: 'localhost',
                endpoint: 'http://0.0.0.0:8005',
                credentials: {
                    accessKeyId: 'MockAccessKeyId',
                    secretAccessKey: 'MockSecretAccessKey',
                },
            }
        }
        return new SESv2Client(sesClientOptions);
    }
}