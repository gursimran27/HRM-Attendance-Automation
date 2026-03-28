# Telegram-Triggered HRM Automation

This project automates the Check-In and Check-Out process on your HRM portal using a Telegram Bot. It uses Node.js, Express, Playwright, and the Telegram Bot API.

## Features
- **Secure:** Only the registered Telegram User ID can trigger the bot.
- **Automated:** Uses Playwright (headless browser) to automatically log in and click the attendance button.
- **Easy:** Built to easily deploy on Render's free tier.

## Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```
   *Note: Playwright also requires browser binaries. On your first time running, Playwright will automatically download them, or you can run `npx playwright install chromium`.*

2. **Configure Environment:**
   Open `.env` and fill in your details:
   - `TELEGRAM_BOT_TOKEN`: The token you received from `@BotFather`.
   - `ALLOWED_TELEGRAM_USER_ID`: Your personal Telegram ID from `@userinfobot`.
   - `HRM_EMAIL`: Your HRM username/email.
   - `HRM_PASSWORD`: Your HRM password.

3. **Run the Bot:**
   ```bash
   npm start
   ```

## Render Deployment

1. Set up a new "Web Service" on [Render](https://render.com) and connect your GitHub repository.
2. Under "Build Command", you **MUST** use this exact command so Render downloads the Playwright browser:
   `npm install && npx playwright install chromium`
3. Set your "Start Command" to: `npm start`
4. Go to **Environment Variables** in the Render dashboard and paste the variables from your `.env` file!

## Bot Usage

From Telegram, just text your bot:
- `checkin or in`
- `checkout or out`
- `status`
