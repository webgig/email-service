export interface EmailClientApi {
    send(httpClient: any): Promise<SendEmailResponse>;
}

export interface SendEmailResponse {
    status: number;
    message?: string;
    errors?: any
}

