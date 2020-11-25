#!/bin/bash

source ./scripts/envs.sh

endpoint_url="http://localhost:8000"
dynamodb_table_name="NasaEvents"

aws dynamodb create-table --endpoint-url $endpoint_url --cli-input-json file://scripts/create-table.json