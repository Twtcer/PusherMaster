
import { AxiosRequestConfig } from 'axios'
import { IPusher } from '@/interfaces/IPusher'
import { SendOption, SendResult, proxy2httpsAgent, Proxy, request, RequestConfig } from '@/utils'

interface PushPlusConfig {
    token?: string
    key?: {
        token: string
    }
    proxy?: Proxy
}

interface PushPlusOptions {
    title?: string
    content: string
    topic?: string
    template?: string
    [name: string]: any
}

class PushPlus implements IPusher {
    protected _KEY: string
    readonly baseURL = 'http://www.pushplus.plus/send'
    httpsAgent?: AxiosRequestConfig['httpsAgent']

    constructor({ token, key, proxy }: PushPlusConfig) {
        const $key = {
            token,
            ...key,
        }

        if (!$key.token) {
            // TODO: 添加多语言支持
            throw new Error('Miss parameter: token')
        }
        this._KEY = $key.token
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
        let pushplusOptions: PushPlusOptions
        if (sendOptions.customOptions) {
            pushplusOptions = sendOptions.customOptions
        } else {
            pushplusOptions = {
                content: sendOptions.message,
            }
            if (sendOptions.title) {
                pushplusOptions.title = sendOptions.title

            }
            if (['html', 'markdown'].includes(sendOptions.type || '')) {
                pushplusOptions.template = sendOptions.type
            }
        }
        pushplusOptions.token = this._KEY
        if (sendOptions.extendOptions) {
            pushplusOptions = {
                ...pushplusOptions,
                ...sendOptions.extendOptions,
            }
        }

        const requestOptions: RequestConfig = {
            url: `${this.baseURL}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: pushplusOptions,
        }

        if (this.httpsAgent) {
            requestOptions.httpsAgent = this.httpsAgent
        }

        return request(requestOptions)
    }
}

export { PushPlus }
