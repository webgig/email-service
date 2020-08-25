export interface EmailConfig {
    to: Email[];
    cc?: Email[];
    bcc?: Email[];
    from: Email;
    subject: string;
    body: string
}

export interface Email {
    email: string;
    name: string;
}