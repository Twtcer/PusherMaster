
import { AxiosRequestConfig } from 'axios'
import { Proxy, RequestConfig, SendOption, SendResult, proxy2httpsAgent, request } from '@/utils'
import { IPusher } from '@/interfaces/IPusher'

interface BarkConfig {
    key?: {
        token: string
        baseURL?: string
    }
    baseURL?: string
    token?: string
    proxy?: Proxy
}

interface BarkOptions {
    device_key?: string
    title: string
    body: string
    [name: string]: any
}

class Bark implements IPusher {
    protected _KEY: string
    readonly baseURL = 'https://api.day.app/push'
    httpsAgent?: AxiosRequestConfig['httpsAgent']

    constructor({ token, baseURL, key, proxy }: BarkConfig) {
        const $key = {
            token,
            baseURL,
            ...key,
        }
        if (!$key.token) {
            throw new Error('Missing Parameter: token')
        }
        this._KEY = $key.token
        if ($key.baseURL) {
            this.#baseURL = $key.baseURL
        }
        if (proxy && proxy.enable) {
            this.httpsAgent = proxy2httpsAgent(proxy)
        }
    }

    async send(sendOptions: SendOption): Promise<SendResult> {
        if (!sendOptions.message && !sendOptions.customOptions) {
            return {
                code: 0,
                message: 'Missing parameter: message',
                data: '',
            }
        }
        let barkOptions: BarkOptions
        if (sendOptions.customOptions) {
            barkOptions = sendOptions.customOptions
        } else {
            barkOptions = {
                title: sendOptions.title || sendOptions.message.split('\n')[0].trim().slice(0, 10),
                body: sendOptions.message,
            }
        }
        if (sendOptions.extendOptions) {
            barkOptions = {
                ...barkOptions,
                ...sendOptions.extendOptions,
            }
        }
        if (!barkOptions.device_key) {
            barkOptions.device_key = this._KEY
        }

        const requestOptions: RequestConfig = {
            url: `${this.baseURL}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: barkOptions,
        }

        if (this.httpsAgent) {
            requestOptions.httpsAgent = this.httpsAgent
        }

        return request(requestOptions)
    }

}

export { Bark }
