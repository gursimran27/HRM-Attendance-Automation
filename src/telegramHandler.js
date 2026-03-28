const { handleCheckin } = require('./automation/checkin');
const { handleCheckout } = require('./automation/checkout');
const { handleStatus } = require('./automation/status');

module.exports = function setupTelegramHandlers(bot) {
  // Use optional chaining / default string for robust checks
  const allowedUserId = process.env.ALLOWED_TELEGRAM_USER_ID ? process.env.ALLOWED_TELEGRAM_USER_ID.trim() : null;

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const text = msg.text ? msg.text.toLowerCase().trim() : '';

    // Security check
    if (allowedUserId && userId !== allowedUserId) {
        bot.sendMessage(chatId, `❌ Unauthorized. Your ID (${userId}) is not allowed to use this bot.`);
        return;
    }

    if (text === '/start') {
        bot.sendMessage(chatId, '🤖 Welcome to the HRM Automation Bot!\n\nSend `checkin` to check in, or `checkout` to check out.');
        return;
    }

    if (text === 'checkin' || text === '/checkin' || text === 'in') {
        bot.sendMessage(chatId, '⏳ Starting Check-In process...');
        try {
            await handleCheckin();
            bot.sendMessage(chatId, '✅ HRM Check-In completed successfully.');
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, `❌ Check-In failed: ${error.message}`);
        }
    } 
    else if (text === 'checkout' || text === '/checkout' || text === 'out') {
        bot.sendMessage(chatId, '⏳ Starting Check-Out process...');
        try {
            await handleCheckout();
            bot.sendMessage(chatId, '✅ HRM Check-Out completed successfully.');
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, `❌ Check-Out failed: ${error.message}`);
        }
    }else if (text === 'status' || text === '/status') {
        bot.sendMessage(chatId, '⏳ Getting status...');
        try {
            const status = await handleStatus();
            bot.sendMessage(chatId, status);
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, `❌ Status check failed: ${error.message}`);
        }
    }
     else if(text == 'hi' || text == 'hello'){
        bot.sendMessage(chatId, 'Hello! Send `checkin` or `checkout`');
    }
    else {
        bot.sendMessage(chatId, '❓ Unknown command. Send `checkin` or `checkout`.');
    }
  });
};
