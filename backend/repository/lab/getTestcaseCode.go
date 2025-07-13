package lab

import (
	"context"
	"cugrader/connection/db"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func getCodeCollection() *mongo.Collection {
	return db.MongoClient.Database("cugrader").Collection("code")
}

func GetTestcaseCollection() *mongo.Collection {
	return db.MongoClient.Database("cugrader").Collection("testcase")
}

func GetCodeContent(ctx context.Context, objectID string) (string, error) {
	collection := getCodeCollection()
	filter := bson.M{"_id": objectID}

	var result struct {
		Content string `bson:"content"`
	}

	err := collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return "", nil // No code found
		}
		return "", err
	}

	return result.Content, nil
}

func GetTestcaseContent(ctx context.Context, testcaseObjectID string) (MultilangTestcase, error) {
	collection := GetTestcaseCollection()
	filter := bson.M{"_id": testcaseObjectID}

	var testcaseMongoObject TestcaseMongoModel
	err := collection.FindOne(ctx, filter).Decode(&testcaseMongoObject)
	if err != nil {
		return MultilangTestcase{}, err // Other error
	}

	inputCodeContent, err := GetCodeContent(ctx, testcaseMongoObject.Input)
	if err != nil {
		return MultilangTestcase{}, err
	}
	outputCodeContent, err := GetCodeContent(ctx, testcaseMongoObject.Output)
	if err != nil {
		return MultilangTestcase{}, err
	}

	return MultilangTestcase{
		Input:  inputCodeContent,
		Output: outputCodeContent,
	}, nil
}
