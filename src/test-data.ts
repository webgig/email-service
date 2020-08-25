export const subject = "some subject";
export const body = "some body";
export const to  = {email:"webgig.sagar@gmail.com",name:"TO Receiver"};
export const cc  = {email:"webgig.sagar@gmail.com", name:"CC Receiver"};
export const bcc = {email:"webgig.sagar@gmail.com", name:"BCC Receiver"};
export const fromEmail = {email: "webgig.sagar@gmail.com", name: "From Name" }

export const emailTestConfig = {to: [to], cc: [cc], bcc: [bcc], from: fromEmail, subject: subject, body: body};
export const invalidEmailConfig = {...emailTestConfig, to:[{email:"invalid email", name:"invalid name"}]}