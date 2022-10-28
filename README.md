# Quizae

## Room for Improvements

Game model relies on embedded documents for game data (questions, categories, answers).
This will not scale, if there are games with a lot of data. Prisma cannot filter and query
this data efficiently, and it would be better if there were proper models for this part of application.

No tests - there should be functional and smoke tests for the app.

No testing data - maybe introducing some sort of fixtures/seeds isn't a bad idea. 

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
