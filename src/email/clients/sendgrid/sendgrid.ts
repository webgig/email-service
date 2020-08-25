import {EmailConfig} from '../emailConfig';
import {EmailClientApi, SendEmailResponse} from '../emailClientApi';
import {HttpClientAPI} from "../httpClient";

export default class Sendgrid implements EmailClientApi {
    httpClient: HttpClientAPI

    constructor(httpClient: HttpClientAPI) {
        this.httpClient = httpClient;
    }

    async send(emailConfig: EmailConfig): Promise<SendEmailResponse> {
        try {
            const data = {
                personalizations: [
                    {
                        to: emailConfig.to.map((to) => ({email: to.email,name: to.name})),
                        cc: emailConfig.cc  && emailConfig.cc.map((cc) => ({email: cc.email, name: cc.name})),
                        bcc: emailConfig.bcc && emailConfig.bcc.map((bcc) => ({email: bcc.email, name: bcc.name}))
                    }
                ],
                from: emailConfig.from,
                subject: emailConfig.subject,
                content: [{type: "text/plain", value: emailConfig.body}]
            };
            const response = await this.httpClient.post("/send", data);
            return {status: response.status, message: response.status === 202 ? "Email sent using Sendgrid": undefined};
        } catch (e) {
            return  {
                message: e.toString(),
                errors: e.response && e.response.data || undefined,
                status: e.response && e.response.status || 500
            }
        }
    }
}

