FROM node:19-alpine AS build

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

FROM node:19-alpine AS production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

EXPOSE 3000

USER node

CMD [ "node", "dist/main.js" ]

FROM node:19 AS development

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]
