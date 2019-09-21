const SlackBot = require('slackbots');
const bot = new SlackBot({
  // Bot User OAuth Access Token
  token: 'xoxb-293269438533-770093972343-pgTFutldXUiYMCLwFl4fWCt5',
  name: 'testbot'
});

bot.on('start', () => {
    //bot.postMessageToUser('lae', 'Hello there!', { icon_emoji: ':smiley:' });
    bot.postMessageToChannel('hackathon', 'Hello there!', { icon_emoji: ':smiley:'});
});

bot.on('message', (data) => {
  if (data.type !== 'message') return;
  //bot.postMessageToUser('lae', 'Goodbye!', { icon_emoji: ':smiley:'});
  bot.postMessageToChannel('hackathon', 'Goodbye!', { icon_emoji: ':smiley:'});
});

bot.on('error', (error) => {
  console.log("ERROR", error);
});
