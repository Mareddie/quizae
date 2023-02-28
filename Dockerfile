FROM node:19-alpine

WORKDIR /usr/src/app

COPY package*.json .
COPY /prisma ./prisma

RUN npm ci
RUN npx prisma generate

COPY nest-cli.json .
COPY tsconfig* .
COPY /src ./src
COPY /test ./test

RUN npm run build

ENV NODE_ENV production

RUN npm ci --omit=dev && npm cache clean --force

RUN chown -R node ./node_modules
RUN chown -R node ./dist

EXPOSE 3000

USER node

CMD [ "node", "dist/main.js" ]
