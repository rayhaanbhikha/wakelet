#!/bin/bash

# TODO: check for aws installation

export AWS_REGION="eu-central-1"
export AWS_ACCESS_KEY_ID="some-key"
export AWS_SECRET_ACCESS_KEY="some-key"
export AWS_PAGER=""

endpoint_url="http://localhost:8000"
dynamodb_table_name="NasaEvents"

aws dynamodb delete-table --endpoint-url $endpoint_url --table-name $dynamodb_table_name

aws dynamodb create-table --endpoint-url $endpoint_url --cli-input-json file://scripts/create-table.json

aws dynamodb list-tables --endpoint-url $endpoint_url