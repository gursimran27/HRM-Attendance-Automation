require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const setupTelegramHandlers = require('./telegramHandler');

const app = express();
const port = process.env.PORT || 3000;

// Dummy route for Render health check
app.get('/', (req, res) => {
  res.send('HRM Telegram Bot is running!');
});

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.warn("Missing TELEGRAM_BOT_TOKEN in environment variables (maybe local?).");
} else {
    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, { polling: true });
    
    // Setup handlers
    setupTelegramHandlers(bot);
    console.log(`Telegram bot initialization started!`);
}

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
