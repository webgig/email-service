import Sendgrid from "./clients/sendgrid/sendgrid";
import Mailgun from "./clients/mailgun/mailgun";
import EmailService from "./emailService";
import {HttpClientFactory} from "./clients/httpClient";
import {bcc, body, cc, emailTestConfig, fromEmail, subject, to} from "../test-data";
import {EmailClientApi} from "./clients/emailClientApi";

describe('EmailService', () => {
    let sendgrid: EmailClientApi,
        mailgun: EmailClientApi,
        emailService: EmailService;

    beforeEach(() => {
        sendgrid = new Sendgrid(HttpClientFactory.create({baseUrl: 'http://sendgrid-base-url', timeout: 1000, headers:{}}));
        mailgun = new Mailgun(HttpClientFactory.create({baseUrl: 'http://mailgun-base-url', timeout: 1000, headers:{}}));
        emailService = new EmailService([sendgrid, mailgun]);
    })

    it('should use first email client provided as a default email client', async () => {
        sendgrid.send = jest.fn().mockResolvedValue({status: 201});

        await emailService.send([to], [cc], [bcc], fromEmail, subject, body);

        expect(sendgrid.send).toHaveBeenCalledWith(emailTestConfig)
    });

    it('should use the second email client when first fails', async () => {
        sendgrid.send = jest.fn().mockResolvedValue({status: 500});
        mailgun.send = jest.fn().mockResolvedValue({status: 200});

        await emailService.send([to], [cc], [bcc], fromEmail, subject, body);

        expect(mailgun.send).toHaveBeenCalledWith(emailTestConfig)
    });

    it('should throw an error when both email services fail', async () => {
        sendgrid.send = jest.fn().mockResolvedValue({status: 500});
        mailgun.send = jest.fn().mockResolvedValue({status: 500});

        await expect(async () => {
            await emailService.send([to], [cc], [bcc], fromEmail, subject, body);
        }).rejects.toThrowError('An error occurred while sending email')
    });
});