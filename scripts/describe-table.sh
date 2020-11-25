#!/bin/bash

source ./scripts/envs.sh

endpoint_url="http://localhost:8000"
dynamodb_table_name="NasaEvents"

aws dynamodb describe-table --endpoint-url $endpoint_url --table-name $dynamodb_table_name