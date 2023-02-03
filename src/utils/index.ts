import axios, { Method, AxiosRequestConfig } from 'axios'
import qs from 'qs'
import debug from 'debug'
import { SocksProxyAgent, SocksProxyAgentOptions } from 'socks-proxy-agent'
import tunnel from 'tunnel'

interface ObjectData {
    [name: string]: any
}

//
interface SendOption {
    message: string
    title?: string
    type?: string
    to?: string | Array<string>
    customOptions?: any
    extendOptions?: any
}

//
interface SendResult {
    code: number
    message: string
    data: any
}

interface Proxy {
    enable: boolean
    host: string
    port: number
    protocol?: 'http' | 'https'
    username?: string
    password?: string
}
interface RequestConfig {
    url: string
    query?: Record<string, unknown>
    data?: Record<string, unknown> | string | Buffer | ArrayBuffer
    method?: Method
    headers?: object
    baseURL?: string
    httpsAgent?: string
}

const Debugger = debug('push:request')

const request = async (config: RequestConfig): Promise<SendResult> => {
    try {
        Debugger('ajax config: %O', config)
        const { url, query = {}, method = 'GET', headers = {}, baseURL = '' } = config
        let { data = {} } = config

        if (headers['Content-Type'] === 'application/x-www-form-urlencoded' && typeof data === 'object') {
            data = qs.stringify(data)
        }

        const response = await axios(url, {
            baseURL,
            method,
            headers,
            params: query,
            data,
            timeout: 10000,
        })
        Debugger('response data: %O', response)
        if (response.data) {
            if ( response.data.code === 200) {
                return {
                    code: 200,
                    message: 'success',
                    data: response,
                }
            }
            return {
                code: response.data.code,
                message: 'error',
                data: response,
            }
        }
        return {
            code: 100,
            message: 'No response data',
            data: response,
        }
    } catch (error) {
        return {
            code: 500,
            message: 'error',
            data: error,
        }
    }
}

// 代理对象转httpsAgent
const proxy2httpsAgent = (proxy: Proxy, protocol = 'https'): AxiosRequestConfig['httpsAgent'] | null => {
    if (proxy.host && proxy.port) {
        let agent: AxiosRequestConfig['httpsAgent']
        if (proxy.protocol?.includes('socks')) {
            const proxyOptions: SocksProxyAgentOptions = {
                hostname: proxy.host,
                port: proxy.port,
            }
            if (proxy.username && proxy.password) {
                proxyOptions.userId = proxy.username
                proxyOptions.password = proxy.password
            }
            agent = new SocksProxyAgent(proxyOptions)
        } else {
            const proxyOptions: tunnel.ProxyOptions = {
                host: proxy.host,
                port: proxy.port,
            }
            if (proxy.username && proxy.password) {
                proxyOptions.proxyAuth = `${proxy.username}:${proxy.password}`
            }
            if (protocol === 'http') {
                if (proxy.protocol === 'https') {
                    agent = tunnel.httpOverHttps({
                        proxy: proxyOptions,
                    })
                } else {
                    agent = tunnel.httpOverHttp({
                        proxy: proxyOptions,
                    })
                }
            } else if (proxy.protocol === 'https') {
                agent = tunnel.httpsOverHttps({
                    proxy: proxyOptions,
                })
            } else {
                agent = tunnel.httpsOverHttp({
                    proxy: proxyOptions,
                })
            }
        }
        if (!protocol || protocol === 'https') {
            agent.options.rejectUnauthorized = false
        }
        return agent
    }
    return null
}

export { RequestConfig, SendOption, SendResult, ObjectData, Proxy, request, proxy2httpsAgent }
