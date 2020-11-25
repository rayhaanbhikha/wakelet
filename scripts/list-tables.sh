#!/bin/bash

source ./scripts/envs.sh

endpoint_url="http://localhost:8000"
dynamodb_table_name="NasaEvents"

aws dynamodb list-tables --endpoint-url $endpoint_url