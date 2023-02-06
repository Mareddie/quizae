FROM node:19
ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./
COPY tsconfig*.json ./

RUN npm install
RUN npx prisma generate

COPY src ./

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/main.js" ]
