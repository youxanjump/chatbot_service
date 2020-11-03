// 引用linebot SDK
const linebot = require('linebot');

// YOUR-APP-ID: The App ID GUID found on the www.luis.ai Application Settings page.
const LUISappId = 'Modify Here';

// YOUR-PREDICTION-KEY: Your LUIS authoring key, 32 character value.
const LUISPredictionKey = 'Modify Here';

// YOUR-PREDICTION-ENDPOINT: Replace this with your authoring key endpoint
const LUISPriditionEndpoint = 'Modify Here';

// YOUR-LUIS-VERSION
const LUISversionId = '0.1';

const requestPromise = require('request-promise');
const queryString = require('querystring');

// 用於辨識Line Channel的資訊，由Line Developer取得以下資訊
const bot = linebot({
  channelId: 'Modify Here',
  channelSecret: 'Modify Here',
  channelAccessToken: 'Modify Here',
});

// 當有人傳送訊息給LineBot時，會執行的動作(27-70行)
bot.on('message', async (event) => {

  // 取得使用者所傳的文字訊息
  const utterance = event.message.text;
  console.log(`Recieved message ${utterance} from Linebot`);

  // 要傳給LUIS去判斷Intent的格式
  const queryParams = {
    'show-all-intents': true,
    verbose: true,
    query: utterance,
    'subscription-key': LUISPredictionKey,
  };

  // 將上面的格式包在這個API裡頭（讓我們的程式知道LUIS在哪裡）
  const pridictionUri = `${LUISPriditionEndpoint}luis/prediction/v3.0/apps/${LUISappId}/slots/production/predict?${queryString.stringify(
    queryParams
  )}`;

  // 傳送一個Post過去上述API，response就是LUIS回傳給我們的資訊
  const response = await requestPromise(pridictionUri);
  // 會是LUIS判斷該使用者傳的文字的Intent的機率，你可以把註解解開來看看是什麼
  // console.log(`Response from LUIS: ${respunse}`);

  // 直接取得機率最高的Intent
  const intent = JSON.parse(response).prediction.topIntent;
  console.log(`top intent: ${intent}`);

  // 要回傳給Linebot的答案，現在預設就單純把intent傳過去
  const answer = intent;

  // 使用event.reply(要回傳的訊息)方法可將訊息回傳給使用者
  event
    .reply(answer)
    .then(() => {
      // 當訊息成功回傳後的處理
      console.log(`Success reply the answer: ${answer}`);
    })
    .catch(error => {
      // 當訊息回傳失敗後的處理
      console.log(`error at reply message: ${error}`);
    });

});

// Lintbot所監聽的webhook路徑與port，收到訊息的時候會從這裡開始觸發，接著就會執行上面27-70行的東西
bot.listen('/linewebhook', 3000, () => {
  console.log('[LINEBOT已準備就緒]');
});

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

// 用來辨識Facebook Messenger Chatbot的資訊
const PAGE_ACCESS_TOKEN = 'Modify Here';

// For facebook messenger webhook verify
const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = 'Modify Here';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

// Initiate settings about fb messenger chatbot
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/messengerwebhook', verifyWebhook);

// callSendAPI & handleMessage為用來回傳訊息給Messenger的function
// 因為fb messemger不像line有提供比較完善的API，所以有些東西要自己做
function callSendAPI(senderPsid, response) {
  // Construct the message body
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  const endpoint = `https://graph.facebook.com/v8.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  request(
    {
      uri: endpoint,
      method: 'POST',
      json: requestBody,
    },
    err => {
      if (!err) {
        console.log('message sent!');
      } else {
        console.error(`Unable to send message:${err}`);
      }
    }
  );
}

function handleMessage(senderPsid, answer) {
  const response = {
    text: answer,
  };

  // Send the response message
  callSendAPI(senderPsid, response);
}

// 當有人傳送訊息給Messenger Chatbot時，會執行的動作
// 也是因為不像line有提供比較完善的API，所以寫法比較沒那麼直覺
// 需要用到一些比較原始的Post之類的東西
app.post('/messengerwebhook', (req, res) => {
  // Parse the request body from the POST
  const { body } = req;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    body.entry.forEach(async function (entry) {

      // Gets the body of the webhook event
      const webhookEvent = entry.messaging[0];
      const utterance = webhookEvent.message.text;
      console.log(`Recieved message '${utterance}' from messenger`);

      // Get the sender PSID(傳訊息的人的ID)
      const senderPsid = webhookEvent.sender.id;
      console.log(`Sender ID: ${senderPsid}`);

      // 跟上面LINE的一樣，是要傳給LUIS的東西(收到question後，跟Linebot處理方式一樣)
      const queryParams = {
        'show-all-intents': true,
        verbose: true,
        query: utterance,
        'subscription-key': LUISPredictionKey,
      };

      const pridictionUri = `${LUISPriditionEndpoint}luis/prediction/v3.0/apps/${LUISappId}/slots/production/predict?${queryString.stringify(
        queryParams
      )}`;

      const response = await requestPromise(pridictionUri);
      const intent = JSON.parse(response).prediction.topIntent;

      const answer = intent;

      // Display the response from the REST call.
      console.log(`top intent: ${intent}`);
      console.log(`answer: ${answer}`);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      handleMessage(senderPsid, answer);
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

app.listen(5000, () => console.log('[FACEBOOK MESSENGER CHATBOT已準備就緒]'));
