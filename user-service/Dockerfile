FROM node:18-alpine

WORKDIR /app

# Install build dependencies for bcryptjs
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Remove build dependencies to keep image small
RUN apk del python3 make g++

EXPOSE 3001

CMD ["node", "dist/main"]