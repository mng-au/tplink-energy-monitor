FROM node:14-alpine

WORKDIR /app

COPY src ./src
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .

RUN npm ci

RUN npm run build

EXPOSE 3000/tcp

CMD ["npm", "run", "start"]
