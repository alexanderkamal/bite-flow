import Mailjet from "node-mailjet";
import { IEmailProvider } from "./email.interface";

interface MailjetConfig {
    apiKey: string;
    apiSecretKey: string;
    fromEmail: string;
    fromName: string;
}

export class MailjetEmailProvider implements IEmailProvider {
    private client: Mailjet;
    private fromEmail: string;
    private fromName: string;

    constructor(config: MailjetConfig) {
        this.client = new Mailjet({
            apiKey: config.apiKey,
            apiSecret: config.apiSecretKey,
    });
        this.fromEmail = config.fromEmail;
        this.fromName = config.fromName;

    }

    async sendEmail(to: string, subjet: string, html: string): Promise<void> {
         await this.client.post("send", {version: "v3.1"}).request({
            Messages: [
                {
                    From: {
                        Email: this.fromEmail,
                        Name: this.fromName,
                    },
                    To: [
                        {
                            Email: to
                        }
                    ],
                    subjet: subjet,
                    HTMLPart: html
                }
            ]
         })
    }

}