import Mailgun from "./mailgun";
import {EmailClientApi} from "../emailClientApi";
import {HttpClientFactory} from "../httpClient";
import {bcc, body, cc, emailTestConfig, fromEmail, invalidEmailConfig, subject, to} from "../../../test-data";

describe('mailgun', () => {
    let httpClient: any;
    let mailgun: EmailClientApi;

    beforeEach(() => {
        httpClient = HttpClientFactory.create({
            baseUrl: 'http://mailgun-base-url-test',
            timeout: 10000,
            headers: {
                Authorization: `Basic ` + Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')
            },
        });
        mailgun = new Mailgun(httpClient);
    })

    it('should send a http post request to sendgrid with proper data', async () => {
        httpClient.post = jest.fn().mockImplementationOnce(() => Promise.resolve({status: 200}))

        const result = await mailgun.send(emailTestConfig)

        expect(result.status).toBe(200);
        expect(httpClient.post).toHaveBeenCalledWith("/messages", null,
            {
                params: {
                    text: body,
                    from: `${fromEmail.name} <${fromEmail.email}>`,
                    to: to.email,
                    cc: cc.email,
                    bcc: bcc.email,
                    subject: subject
                }
            }
        )
    });

    it('should return a 400 error for invalid email', async () => {
        httpClient.post = jest.fn().mockRejectedValue(({response:{status: 400}, toString:()=>{}}))
        const result = await mailgun.send(invalidEmailConfig)
        expect(result.status).toBe(400)
    });

    it('should return 500 status code when an error occurs', async () => {
        const result = await mailgun.send(emailTestConfig)

        expect(result).toEqual({status: 500, message: 'Error: getaddrinfo ENOTFOUND mailgun-base-url-test'})
    });
});