const { Api, TelegramClient } = require('telegram');
const { StringSession, StoreSession } = require('telegram/sessions');
const input = require('input');
require('dotenv').config();

const auth = async () => {
  const config = process.env;
  let client;

  // const storeSession = new StoreSession('folder_session');
  client = new TelegramClient(
    new StringSession(config.STRING_SESSION),
    Number(config.API_ID),
    config.API_HASH
  );

  if (!config.STRING_SESSION) {
    await client.start({
      phoneNumber: config.PHONE,
      // password: async () => await input.text('password?')
      phoneCode: async () => await input.text('Code ? '),
      onError: (err) => console.log(err),
    });
    console.log('You should now be connected.');
    console.log(client.session.save());
  } else {
    await client.connect();
  }

  return client;
};

const getMessagesFromChannel = async (client, channelName) => {
  await client.invoke(
    new Api.channels.GetFullChannel({ channel: channelName })
  );

  const result = await client.invoke(
    new Api.messages.GetHistory({
      peer: channelName,
      limit: 5,
      offset_date: 0,
      offset_id: 0,
      max_id: 0,
      min_id: 0,
      add_offset: 0,
      hash: 0,
    })
  );

  return result.messages.map((message) => {
    if (message.groupedId) console.log('groupedId', message.groupedId);
    return {
      // date: new Date(message.date * 1000),
      // from_id: message.fromId,
      text: message.message,
      // peer_id: message.peerId,
      // media: message.media,
      // replies: message.replies,
    };
  });
};

(async () => {
  const client = await auth();

  client.addEventHandler(async (update) => {
    if (!update.hasOwnProperty('message')) {
      return;
    }

    const chatID = Number(update.message.chatId);

    if (update.message.message.startsWith('/start')) {
      client.sendMessage(chatID, {
        message: 'Welcome to my Telegram bot!',
      });
    }

    if (update.message.message.startsWith('/t')) {
      const messages = await getMessagesFromChannel(client, '@Batumi_helps');
      client.sendMessage(chatID, {
        message: messages.map((obj) => obj.text).join('\n'),
      });
    }
  });
})();
