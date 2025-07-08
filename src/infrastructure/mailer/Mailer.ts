
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2"
import { createTransport } from "nodemailer"
import SESTransport from "nodemailer/lib/ses-transport";
import SMTPTransport from "nodemailer/lib/smtp-transport";
export class Mailer {
    private getClient(): SESv2Client {
        const sesClientOptions = {}
        return new SESv2Client(sesClientOptions);
    }

    async sendEmail(from: string, to: string, subject: string, body: string): Promise<void | SESTransport.SentMessageInfo | SMTPTransport.SentMessageInfo> {
        if (process.env.STAGE_NAME === "dev" || process.env.IS_OFFLINE) {
            const transporter = createTransport({
                host: "127.0.0.1",
                port: 1025,
                secure: false,
            });

            await transporter.sendMail({
                from: from,
                to: to,
                subject: subject,
                text: body,
            });

        } else {
            await this.getClient().send(new SendEmailCommand({
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
    }
}