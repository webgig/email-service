import axios, {AxiosInstance} from "axios";

export interface HttpClientAPI {
    post(endpoint: string, data?: any , params?: any ): Promise<any>;
}

export interface HttpClientConfig {
    baseUrl?: string;
    timeout?: number;
    headers?: object,
}

export class HttpClient implements HttpClientAPI{
    client: AxiosInstance

    constructor(config?: HttpClientConfig) {
        this.client = axios.create({
            baseURL: config?.baseUrl,
            timeout: config?.timeout,
            headers: config?.headers,
        });
    }

    post(endpoint: string, data: any, params:any ): Promise<any> {
        return this.client.post(endpoint,data, params);
    }
}

export class HttpClientFactory {
    public static create(clientConfig?: HttpClientConfig): HttpClientAPI{
        return new HttpClient(clientConfig)
    }
}