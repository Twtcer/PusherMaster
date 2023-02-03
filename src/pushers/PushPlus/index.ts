
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

    async send(sendOption: SendOption): Promise<SendResult> {
        if (!sendOption.message && !sendOption.customOptions) {
            return {
                code: 0,
                message: 'Missing parameter: message',
                data: '',
            }
        }
        let pushplusOptions: PushPlusOptions
        if (sendOption.customOptions) {
            pushplusOptions = sendOption.customOptions
        } else {
            pushplusOptions = {
                content: sendOption.message,
            }
            if (sendOption.title) {
                pushplusOptions.title = sendOption.title

            }
            if (['html', 'markdown'].includes(sendOption.type || '')) {
                pushplusOptions.template = sendOption.type
            }
        }
        pushplusOptions.token = this._KEY
        if (sendOption.extendOptions) {
            pushplusOptions = {
                ...pushplusOptions,
                ...sendOption.extendOptions,
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
