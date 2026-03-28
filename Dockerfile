FROM mcr.microsoft.com/playwright:v1.42.0-jammy

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project
COPY . .

# Run the bot
CMD ["npm", "start"]
