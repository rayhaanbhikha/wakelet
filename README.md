# Wakelet Coding Exercise

Both the API service and the AWS DynamoDB can be ran inside docker container.

Run the following command to begin both.

```sh
docker-compose up
```

This will spin up a local DynamoDB table and then start the API service in a docker container. The API service will create the `NasaEvents` table in Dynamo and seed it with an arbitrary number of NasaEvents (this is configurable) before starting the server on port 8080.

To view the API contract go to `http://localhost:8080/v1/api-docs`.

## Run Locally

The API service can also be run locally by running the following commands:

```sh
yarn # install all deps

yarn build # convert from from typescript to js

yarn start # start the api service locally on port 8080.

```