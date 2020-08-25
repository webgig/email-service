import Sendgrid from "./sendgrid";
import {EmailClientApi} from "../emailClientApi";
import {HttpClientFactory} from "../httpClient";
import {bcc, body, cc, emailTestConfig, fromEmail, invalidEmailConfig, subject, to} from "../../../test-data";

describe('sendgrid', () => {
    let httpClient: any;
    let sendgrid: EmailClientApi;

    beforeEach(() => {
        httpClient =  HttpClientFactory.create({
            baseUrl: "http://sendgrid-base-url-test",
            timeout: 10000,
            headers: {
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
            },
        });
        sendgrid = new Sendgrid(httpClient);
    })

    it('should send a http post request to sendgrid with proper data', async () => {
        httpClient.post = jest.fn().mockImplementationOnce(() => Promise.resolve({status: 202}))

        const result = await sendgrid.send(emailTestConfig)

        expect(result.status).toBe(202);
        expect(httpClient.post).toHaveBeenCalledWith("/send",
            {
                "content": [{"type": "text/plain", "value": body}],
                "from": fromEmail,
                "personalizations": [{"to": [to],"cc":[cc],"bcc":[bcc]}],
                "subject": subject
            }
        )
    });

    it('should return a 400 error for invalid email', async () => {
        httpClient.post = jest.fn().mockRejectedValue(({response:{status: 400}, toString:()=>{}}))
        const result = await sendgrid.send(invalidEmailConfig)
        console.log(result);
        expect(result.status).toBe(400)
    });

    it('should return 500 status code when an error occurs', async () => {
        const result = await sendgrid.send(emailTestConfig)
        expect(result).toEqual({status: 500, message: 'Error: getaddrinfo ENOTFOUND sendgrid-base-url-test'})
    });
});