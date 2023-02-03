# PusherMaster
集成推送服务
支持钉钉, Discord, 邮件, 飞书, PushDeer, PushPlus, QQ 频道, Server 酱, Showdoc Push, Telegram Bot, 企业微信群机器人, 息知, WxPusher, NowPush, iGot等平台

## 安装
```shell
npm install pusher-master -S

or

yarn add pusher-master
```

## 开发
支持TS，使用rollup打包，以支持类型提示和优化
未使用模块将在编译阶段去除

``` sh
yarn dev
or
npm run dev
```

### debug
项目使用debug包调试信息，如果需要调试则设置环境变量为`DEBUG=push:*`
```sh
cross-env DEBUG=push:* NODE_ENV=development ts-node-dev test/index.test.ts
```

### 编译
```sh
yarn build 
or
npm run build
```

### lint
```sh
yarn lint 
or
npm run lint
```

### commit
```sh
yarn commit
or
npm run commit
```

## 使用

### 单平台推送

### 多平台推送


## 🤝贡献

## 💰支持
如果觉得您觉得这个项目有用的话请给点亮⭐️，非常感谢！

## 📝 License
