import request from "supertest";
import testApp from "../app";
import each from 'jest-each';
import {HttpClientFactory} from "./clients/httpClient";
import {EmailConfig} from "./clients/emailConfig";
import {bcc, body, cc, emailTestConfig, subject, to}  from "../test-data"
import dotenv from 'dotenv';


const sendEmailApi = async (postParams: EmailConfig | object) => {
    const response = await request(testApp)
        .post("/api/send-email")
        .send(postParams);
    return response;
}

describe('/api/send-email', () => {
    let mockHttpClient: any, server:any;

    beforeEach((done) => {
        server = testApp.listen(done)
        jest.mock('./clients/HttpClient');
        mockHttpClient = jest.genMockFromModule('./clients/HttpClient');
        mockHttpClient.post = jest.fn()
        HttpClientFactory.create = jest.fn().mockImplementation(() => mockHttpClient)
        done()
    });

    it('should make an api request to send an email', async (done) => {
        mockHttpClient.post.mockResolvedValue({status: 202});
        const response = await sendEmailApi(emailTestConfig);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({message:"Email sent"});
        expect(mockHttpClient.post).toHaveBeenCalled()
        done();
    });

    it('should respond with an error when both email services is down', async (done) => {
        mockHttpClient.post.mockRejectedValue({response:{status: 500}, toString:()=>{}});
        const response = await sendEmailApi(emailTestConfig);
        expect(response.status).toBe(500);
        expect(response.body).toStrictEqual({
            errorDetails:{
                    description: "An error occurred",
                    apiErrors: [{status: 500},{status: 500}]
                }
            }
        );
        done();
    });

    describe('/send-email error handling', () => {
        it('should respond with an error when an input parameter is missing', async (done) => {
            const response = await sendEmailApi({subject, body});
            expect(response.status).toBe(400);
            expect(response.body).toStrictEqual({
                errorDetails:{
                    description:'Receipient\'s email address is required'
                }
            });
            done()
        });


        each([
            {to: {email: "invalid to email", name: 'test'}, cc, bcc},
            {to, cc: {email: "invalid cc email", name: 'test'}, bcc},
            {to, cc, bcc: {email: "invalid bcc email", name: 'test'}}
        ])
            .it('should respond with a validation error when invalid email address(es) is provided', async (data,done) => {
                const response = await sendEmailApi({
                    to: [data.to],
                    cc: [data.cc],
                    bcc: [data.bcc],
                    subject: subject,
                    body: body
                });

                expect(response.status).toBe(400);
                expect(response.body).toStrictEqual({
                        errorDetails:{
                            description:'One or more email address(es) is invalid'
                        }
                });
                done()
            });
    });

    afterEach((done) => server.close(done))
});


describe.skip('integration test /api/send-email with no mock', () => {
    let server:any;

    beforeEach((done) => {
        server = testApp.listen(done)
        done()
    });


    const emailTestConfig = {
        to: [{email:"webgig.sagar@gmail.com", name:"TO Receiver"}],
        //cc: [{email:"testcc@mailinator.com", name:"TO Receiver"}],
        //bcc: [{email:"testbcc@mailinator.com", name:"TO Receiver"}],
        from: {email: "webgig.sagar@gmail.com", name: "From Name"},
        subject: "some subject",
        body: "some body"
    };

    beforeEach(()=>{
        delete process.env.SENDGRID_API_KEY
        delete process.env.SENDGRID_API_BASE_URL
        delete process.env.MAILGUN_API_KEY
        delete process.env.MAILGUN_API_BASE_URL
        delete process.env.FROM_EMAIL
        delete process.env.FROM_NAME

        dotenv.config();
    })

    it('should make an api request to send an email', async () => {
        const response = await sendEmailApi(emailTestConfig);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({message:"Email sent"});
    });

    it('should failover to mailgun to send an email', async () => {
        process.env.SENDGRID_API_KEY = "wrong api key"
        const response = await sendEmailApi(emailTestConfig);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({message:"Email sent"});
    });

    it('should response with error when both service return an error', async () => {
        process.env.SENDGRID_API_KEY = "wrong api key"
        process.env.MAILGUN_API_KEY = "wrong api key"
        const response = await sendEmailApi(emailTestConfig);
        expect(response.status).toBe(500);
        expect(response.text).not.toBeNull()
    });

    afterEach((done) => server.close(done))
});