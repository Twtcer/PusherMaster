import { PusherType } from './interfaces/PusherType'
import { SendOption, SendResult } from './utils'
import { PushPlus } from './pushers/PushPlus'
import { Bark } from './pushers/Bark'

interface Pusher {
    name: string
    pusher: PushPlus | Bark
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
        pushMasterConfig.forEach((conf) => {
            switch (conf.name) {
                case 'pushplus':
                    this.pushers.push({ name: conf.name, pusher: new PushPlus(conf.config) })
                    break
                case 'bark':
                    this.pushers.push({ name: conf.name, pusher: new Bark(conf.config) })
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
