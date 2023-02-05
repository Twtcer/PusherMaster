import { SendOption, SendResult } from '@/utils'

export interface IPusher {
    send(sendOptions: SendOption): Promise<SendResult>
}
