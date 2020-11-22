package db

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/rayhaanbhikha/wakelet/src/events"
)

type DBRepository struct {
	svc *dynamodb.DynamoDB
}

type EventRecord struct {
	
}

func (db *DBRepository) Put(event events.Event) {
	input := dynamodbattribute.MarshalMap(event)
}

func NewDBRepository() {
	session := session.New(
		aws.NewConfig().WithCredentials(credentials.NewStaticCredentials(
			id: "some-id",
			secret: "some-secret",
			token: "some-token"
		))
	)

	svc := dynamodb.New(sess, &aws.Config{ 
		Region: aws.String("eu-central-1"),
		Endpoint: aws.String("http://localhost:8000")
	})

	return &DB{
		svc: svc,
	}
}
