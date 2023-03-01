# Quizae

## Room for Improvements

Data model is not efficient and could be improved (e.g. extract embedded documents into proper models). Transactions in Mongo DB are probably misused as well - working without them could work better as well.

No testing data - maybe introducing some sort of fixtures/seeds isn't a bad idea.

Classes and design patterns are all over the place - some classes could be merged together and simplified.

Some domains are completely unnecessary and could be removed / consolidated (e.g. simplification of presentation layer)

## Running Quizae

The whole app is containerized, and can be run locally in Docker. Take a look at `docker-compose.yaml` file for local setup, or pull the production image and run it locally.
