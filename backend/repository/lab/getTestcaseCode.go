package lab

import (
	"context"
	"cugrader/connection/db"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func getCodeCollection() *mongo.Collection {
	return db.MongoClient.Database("cugrader").Collection("code")
}

func GetTestcaseCollection() *mongo.Collection {
	return db.MongoClient.Database("cugrader").Collection("multilang_testcase")
}

func GetCodeContent(ctx context.Context, objectID string) (string, error) {
	objectId, err := primitive.ObjectIDFromHex(objectID)
	if err != nil {
		return "", fmt.Errorf("invalid ObjectID: %w", err)
	}

	collection := getCodeCollection()
	filter := bson.M{"_id": objectId}

	var result struct {
		Content string `bson:"content"`
	}

	err = collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return "", nil // No code found
		}
		return "", err
	}

	return result.Content, nil
}

func GetTestcaseContent(ctx context.Context, testcaseObjectID string) (*MultilangTestcase, error) {
	collection := GetTestcaseCollection()
	objectId, err := primitive.ObjectIDFromHex(testcaseObjectID)
	if err != nil {
		return nil, fmt.Errorf("invalid ObjectID: %w", err)
	}
	filter := bson.M{"_id": objectId}

	var testcaseMongoObject TestcaseMongoModel
	err = collection.FindOne(ctx, filter).Decode(&testcaseMongoObject)
	if err != nil {
		return nil, err // Other error
	}

	inputCodeContent, err := GetCodeContent(ctx, testcaseMongoObject.Input)
	if err != nil {
		return nil, err
	}
	outputCodeContent, err := GetCodeContent(ctx, testcaseMongoObject.Output)
	if err != nil {
		return nil, err
	}

	return &MultilangTestcase{
		Input:  inputCodeContent,
		Output: outputCodeContent,
	}, nil
}
