import {HttpClient, HttpClientFactory} from "./httpClient";
import axios from 'axios';
import each from "jest-each";


describe('HttpClient', () => {
     let mockAxios: any;

     beforeEach(()=>{
         jest.mock('axios');
         mockAxios = jest.genMockFromModule('axios');
         axios.create = jest.fn().mockImplementation(() => mockAxios);
         mockAxios.post.mockResolvedValue({status: 200});
     })

    each([
        [{
            baseUrl: 'http://some-base-url',
            timeout: 10000,
            headers:{}
        },{
            baseURL: 'http://some-base-url',
            timeout: 10000,
            headers:{}
        }],
        [{
            timeout: 10000,
            headers:{}
        },{
            timeout: 10000,
            headers:{}
        }]
    ]).it('should pass the correct config to axios',async (config,expected)=>{
        HttpClientFactory.create(config);
        expect(axios.create).toHaveBeenCalledWith(expected);
    })

    it('should send a http post request with correct config', async () => {
        const httpClient = HttpClientFactory.create(
            {
                baseUrl: 'http://some-base-url',
                timeout: 10000,
                headers:{}
            });
        const endpoint = '/endpoint';
        const params = {test:123};
        const data = {test: 123};

        const response = await httpClient.post(endpoint, data, params);
        expect(response).toStrictEqual({status:200})
        expect(mockAxios.post).toBeCalledWith(endpoint,data,params);
    });
});

describe('HttpClientFactory', () => {
    it('should return an instance of type HttpClientApi', async () => {
        const httpClient = HttpClientFactory.create(
        {
            baseUrl: 'http://some-base-url',
            timeout: 10000,
            headers:{}
        });
        expect(httpClient).toBeInstanceOf(HttpClient)
    });

    it('should create an instance of type HttpClientApi with no config', async () => {
        const httpClient = HttpClientFactory.create();
        expect(httpClient).toBeInstanceOf(HttpClient)
    });
});