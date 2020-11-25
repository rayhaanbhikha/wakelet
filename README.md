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
## Things to improve:

- Extract provisioning logic elsewhere.
- Cursor (offsetId) is only encoded in base64, the technically leaks logic to the client. Should ideally be encrypted.
- Current Cursor implementation only works since we're reading (No other crud operations). Ideally want a bidrectional cursor implementation.
- GlobalSecondaryIndexes for ordering events correctly when scanning the DB, rely on a hardcoded Partition Key (type attribute) with a constant value equal to 'NasaEvent'. This would be problematic during high traffic as it would result in a 'hot partition'.
- Use a proper logging service instead of just console.error and console.log.
