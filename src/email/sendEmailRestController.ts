import express from "express";
import Sendgrid from "./clients/sendgrid/sendgrid";
import Mailgun from "./clients/mailgun/mailgun";
import {Email} from "./clients/emailConfig";
import EmailService, {EmailServiceFailure} from "./emailService";
import { HttpClientFactory } from "./clients/httpClient";

const validateEmail = (emailList: Email[][]) => {
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return !emailList.some(emails =>
        emails &&
        emails.some(email => !regexp.test(email.email)));
}

export class SendEmailRestController{
    private emailService: EmailService

    constructor() {
        const timeOut = parseInt(process.env.EMAIL_CLIENT_TIMEOUT as string);
        const sendgrid = new Sendgrid(
            HttpClientFactory.create({
                baseUrl: process.env.SENDGRID_API_BASE_URL as string,
                timeout: timeOut,
                headers: {
                    Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
                }})
        );
        const mailgun = new Mailgun(
            HttpClientFactory.create({
                baseUrl: process.env.MAILGUN_API_BASE_URL as string,
                timeout: timeOut,
                headers: {
                    Authorization: `Basic ` + Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')
                }})
        );

        this.emailService = new EmailService([sendgrid, mailgun]);
    }

    async handle(req: express.Request, res: express.Response, next: express.NextFunction){
        const fromEmail = {email: process.env.FROM_EMAIL as string, name: process.env.FROM_NAME as string};
        try {
            if (!req.body.to)
                throw new InputValidationError("Receipient's email address is required");
            if (!validateEmail([
                req.body.to,
                req.body.cc || null,
                req.body.bcc || null]))
                throw new InputValidationError("One or more email address(es) is invalid");

            await this.emailService.send(req.body.to, req.body.cc, req.body.bcc, fromEmail, req.body.subject, req.body.body);
            return res.json({message:"Email sent"});
        } catch (err) {
            next(err);
        }
    }
};



export class InputValidationError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InputValidationError.prototype);
    }
}
