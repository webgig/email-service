import {EmailConfig} from '../emailConfig';
import {EmailClientApi, SendEmailResponse} from '../emailClientApi';
import {HttpClientAPI} from "../httpClient";

export default class Mailgun implements EmailClientApi {
    httpClient: any

    constructor(httpClient: HttpClientAPI) {
        this.httpClient = httpClient;
    }
    async send(emailConfig: EmailConfig): Promise<SendEmailResponse> {
        try{
            const data = {
                to:  emailConfig.to.map((to) => (to.email)).join(","),
                cc:  emailConfig.cc && emailConfig.cc.map((cc) => (cc.email)).join(",") || null,
                bcc: emailConfig.bcc && emailConfig.bcc.map((bcc) => (bcc.email)).join(","),
                from:  `${emailConfig.from.name} <${emailConfig.from.email}>`,
                subject: emailConfig.subject,
                text: emailConfig.body
            };
            const response = await this.httpClient.post("/messages", null, {params: data})
            return {status: response.status, message: response.status === 200 ? "Email sent using Mailgun": undefined};
        } catch (e){
            return {
                message: e.toString(),
                errors: e.response && e.response.data || undefined,
                status: e.response && e.response.status || 500
            }
        }
    }
}

