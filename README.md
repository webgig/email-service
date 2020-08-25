# Email API
An api to send email with failover. 

The application provides an abstraction between two email services. 
If one service goes down, the service switches to another email service configured.

### To Setup
Run the following

`$ git clone https://github.com/webgig/email-service`
`$ cd email-service`
`$ yarn`
### To test
``yarn test``

### To Build
Run 
`yarn build`

### To run the service
Local `yarn start:dev`

Production `yarn start` , runs the build as well

Integration test contains a real test to test the api. Change describe.skip() to describe() to test.

### Environment Variables
- Uses dotenv to load .env file, alternatively use export.
 
````  
   SENDGRID_API_KEY = ""
   SENDGRID_API_BASE_URL = "https://api.sendgrid.com/v3/mail"
   MAILGUN_API_KEY = ""
   MAILGUN_API_BASE_URL = "https://api.mailgun.net/v3/DOMAIN HERE"
   FROM_NAME  = "TEST FROM"
   FROM_EMAIL  = "INSERT FROM EMAIL HERE" 
   EMAIL_CLIENT_TIMEOUT = 10000
````
### Considerations and Trade-offs
* Controller, service and client apis used to separate different layers of application.
* Unit Testing the service and api and integration testing the controller to get more confidence on the integration.
* Status code 400 and above are used to determine the failover condition.
* Dependency Injection and Testability.
* Http Client Abstraction / Email Client Abstraction.
   
### TODO
* Add security, authentication
* Improve logging capability
* Improve error handling

### API

##### OAS 3.0 
     ` openapi: 3.0.0
       info:
         description: |
           Email Service
         version: 0.0.1
         title: Email Service
         contact:
           email: webgig.sagar@gmail.com
         license:
           name: Apache 2.0
           url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
       servers:
         - url: http://localhost:3000/api
           description: Local env
       paths:
         /send-email:
           post:
             summary: Send an email
             operationId: sendEmail
             requestBody:
               required: true
               content:
                 application/json:
                   schema:
                     $ref: '#/components/schemas/SendEmailRequest'
             responses:
               '200':
                 description: successful operation
                 content:
                   application/json:
                     schema:
                       type: object
                       properties:
                         message: 
                           type: string
                       example: '{message:"Email Sent"}'
               
               '400':
                 description: >-
                   ( One or more email address(es) is invalid  )
                   ( Receipient's email address is required )
                 content:
                   application/json:
                     schema:
                       type: object
                       properties:
                         errorDetails:
                           type: object
                           properties:
                             description:
                               type: string
                             apiError:
                               type: object
                     example: '{"errorDetails":{"description":{"Receipient email address is required"}}}'
               '500':
                 description: An error occurred     
       components:
         schemas:
           SendEmailRequest:
             type: object
             properties:
               to:
                 type: array
                 items:
                   $ref: '#/components/schemas/EmailConfig'
               cc:
                 type: array
                 items:
                   $ref: '#/components/schemas/EmailConfig'
               bcc:
                 type: array
                 items:
                   $ref: '#/components/schemas/EmailConfig'
               subject:
                 type: string
               body:
                 type: string
           EmailConfig:
             type: object
             properties:
               email:
                 type: string
               name:
                 type: string
     `
 ##### Curl
 `curl --location --request POST 'http://localhost:3000/api/send-email'  --header 'Content-Type: application/json' --data '{"to":[{"email":"INSERT_EMAIL_HERE","name":"INSERT_NAME_HERE"}],"subject":"Test","body":"test body"}'`
  