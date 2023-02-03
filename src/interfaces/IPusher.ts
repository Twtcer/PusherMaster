import { SendOption, SendResult } from './response'

export interface IPusher {
    send(sendOption: SendOption): Promise<SendResult>
}
