const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Telegraf } = require('telegraf');
const MESSAGES = require('./messages');
const { handleTextMessage } = require('./handlers/linkHandler');

if (!process.env.BOT_TOKEN) {
  console.error('BOT_TOKEN is missing. Check src/.env');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'logo.png');

bot.start((ctx) =>
  ctx.replyWithPhoto({ source: LOGO_PATH }, { caption: MESSAGES.START }),
);
bot.on('text', handleTextMessage);

bot.catch((err) => {
  console.error('Bot error:', err);
});

bot.launch().catch((err) => {
  console.error('Failed to start bot:', err.message);
  process.exit(1);
});

console.log('GetMedia bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
