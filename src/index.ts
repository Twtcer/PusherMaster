import { PushPlus } from './pushers/PushPlus/index'
import { PusherType } from './interfaces/PusherType'
import { SendOption, SendResult } from './utils'

interface Pusher {
    name: string
    pusher: PushPlus
}

interface PushMasterConfig {
    name: PusherType
    config: any
}

/**
 * PushMaster
 * 支持单或多个调用
 */
class PusherMaster {
    pushers: Array<Pusher> = []

    constructor(pushMasterConfig: Array<PushMasterConfig>) {
        pushMasterConfig.forEach((config) => {
            switch (config.name) {
                case 'pushplus':
                    this.pushers.push({ name: config.name, pusher: new PushPlus(config.config) })
                    break

                default:
                    break
            }
        })
    }

    async send(sendOptions: Array<{ name: string, options: SendOption }> | SendOption): Promise<Array<{ name: string, result: SendResult }>> {
        return Promise.allSettled(
            this.pushers.map(async (pusher) => {
                if (!Array.isArray(sendOptions)) {
                    return {
                        name: pusher.name,
                        result: await pusher.pusher.send(sendOptions),
                    }
                }
                const sendOption = sendOptions.find((option) => option.name === pusher.name || option.name === 'default')
                if (sendOption) {
                    return {
                        name: pusher.name,
                        result: await pusher.pusher.send(sendOption.options),
                    }
                }
                return {
                    name: pusher.name,
                    result: {
                        code: 101,
                        message: 'Missing Options',
                        data: sendOptions,
                    },
                }
            }))
            .then((rets) => rets.map((ret, index) => ret.value || {
                name: this.pushers[index].name,
                result: {
                    code: 500,
                    message: 'Unknown Error',
                    data: ret.data,
                },
            }))
    }
}

export { PusherMaster }
