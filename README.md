# chatbot_service
- 先處理好[Line Developer](https://developers.line.biz/zh-hant/)以及[Messenger Developer](https://developers.facebook.com/docs/messenger-platform/)
- [安裝ngrok](https://ngrok.com/download)
- 進到Luis.ai，就跟上一支程式一樣，把跟LUIS相關的資訊都填進程式中

### For Linebot
- [linebot建立](https://tw.alphacamp.co/blog/line-chatbot-creation-steps)（看到「Channel ID 及 Channel Secret 很重要，不要外洩！」就可以了）
- 取得channelId, ChannelSecret(兩個都在basic settings), channelAccessToken(在Messaging API的最下面)
- 開啟測試用server for linebot
```bash
ngrok http 3000
```
- 把https的那一行貼到line developer的Webhook URL中(在Messaging API，記得網址後面要加上/linewebhook）
- 執行程式
```bash
npm start
```

### For Messenger Chatbot
- 先辦一個臉書粉專（測試用）
- [從developer提供的document建置webhook](https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup?locale=zh_TW) (把chatbot的功能跟粉專綁在一起，還沒有中文翻譯QQ）
- Facebook developer取得Access Token（左邊→Messenger→Settings），並且把它貼到程式裡頭的PAGE_ACCESS_TOKEN
- 開啟測試用server for FB chatbot
```bash
ngrok http 5000
```
- Callback URL→貼上ngrok的https，並且加上/messengerwebhook
- verify token -> 自己隨便設一個，然後把它加到程式裡頭的VERIFY_TOKEN
- 執行程式
```bash
npm start
```
