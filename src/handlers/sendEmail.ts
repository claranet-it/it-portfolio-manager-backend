
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2"


export async function sendEmail(ses: SESv2Client, from: string, to: string, subject: string, body: string) {
    await ses.send(new SendEmailCommand({
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