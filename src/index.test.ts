import { PusherMaster } from '../dist/index'
async () => {
    // Example 1

    const result = await new PusherMaster([
        {
            name: 'pushplus',
            config: {
                key: {
                    token: '******',
                },
            },
        },
    ])
        .send({ message: '测试文本' })
    console.log(result.map((e) => (e.result.code >= 200 && e.result.code < 300 ? `${e.name} 测试成功` : e)))
}
