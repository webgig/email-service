import {EmailClientApi} from "./clients/emailClientApi";
import {Email} from "./clients/emailConfig";

export default class EmailService {
    clients: [EmailClientApi, EmailClientApi]

    constructor(clients: [EmailClientApi, EmailClientApi]) {
        this.clients = clients;
    }

    async send(to: Email[], cc: Email[], bcc: Email[], from: Email, subject: string, body: string) {
        const client1Response = await this.clients[0].send({to, cc, bcc, from, subject, body})
        if (client1Response.status >= 400) {
            // Log the error
            console.log(client1Response);
            console.log("Client 1 Failure:- ", JSON.stringify(client1Response))
            const client2Response = await this.clients[1].send({to, cc, bcc, from, subject, body})
            if (client2Response.status >= 400) {
                // Log the error
                console.log("Client 2 Failure:- ", JSON.stringify(client2Response))
                throw new EmailServiceFailure(
                    "An error occurred while sending email",
                    [client1Response,client2Response]);
            }
        }
        // All went well
    }
}


export class EmailServiceFailure extends Error {
    apiResponse: any[]
    constructor(message: string, apiResponse: any[]) {
        super(message);
        this.apiResponse = apiResponse;
        Object.setPrototypeOf(this, EmailServiceFailure.prototype);
    }
}


