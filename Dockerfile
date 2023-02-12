FROM node:19-alpine AS warmup

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./

RUN npm ci
RUN npx prisma generate

COPY --chown=node:node . .

FROM node:19-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node --from=warmup /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

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
