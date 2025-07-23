package utils

import (
	"context"
	"cugrader/connection/db"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func UpdateCodeContentByID(id string, newContent string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid ObjectID: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.MongoClient.Database("cugrader").Collection("code")

	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{"content": newContent}}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func UpdateMDContentByID(id string, newContent string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid ObjectID: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.MongoClient.Database("cugrader").Collection("markdown")

	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{"content": newContent}}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func InsertCodeToMongo(content string) (string, error) {
	collection := db.MongoClient.Database("cugrader").Collection("code")
	doc := bson.M{"content": content}
	result, err := collection.InsertOne(context.Background(), doc)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func InsertMDToMongo(content string) (string, error) {
	collection := db.MongoClient.Database("cugrader").Collection("markdown")
	doc := bson.M{"content": content}
	result, err := collection.InsertOne(context.Background(), doc)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func InsertMultilangToMongo(inputId string, outputId string) (string, error) {
	inputObjID, err := primitive.ObjectIDFromHex(inputId)
	if err != nil {
		return "", fmt.Errorf("invalid input ObjectID: %w", err)
	}
	outputObjID, err := primitive.ObjectIDFromHex(outputId)
	if err != nil {
		return "", fmt.Errorf("invalid output ObjectID: %w", err)
	}

	collection := db.MongoClient.Database("cugrader").Collection("multilang_testcase")
	doc := bson.M{"input": inputObjID, "output": outputObjID}
	result, err := collection.InsertOne(context.Background(), doc)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func GetCodeContent(objectID string) (string, error) {
	objectId, err := primitive.ObjectIDFromHex(objectID)
	if err != nil {
		return "", fmt.Errorf("invalid ObjectID: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.MongoClient.Database("cugrader").Collection("code")
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

func DeleteCodeByID(objectID string) error {
	objectId, err := primitive.ObjectIDFromHex(objectID)
	if err != nil {
		return fmt.Errorf("invalid ObjectID: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.MongoClient.Database("cugrader").Collection("code")
	filter := bson.M{"_id": objectId}

	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to delete document: %w", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("no document found to delete with id: %s", objectID)
	}

	return nil
}
