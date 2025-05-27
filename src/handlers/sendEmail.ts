
import { SendEmailCommand } from "@aws-sdk/client-sesv2"
import { SesClient } from "@src/infrastructure/mailer/sesClient";


export async function sendEmail(ses: SesClient, from: string, to: string, subject: string, body: string) {
    await ses.getClient().send(new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [to] },
        Content: {
            Simple: {
                Subject: { Data: subject },
                Body: { Text: { Data: body } },
            },
        },
    }));
}