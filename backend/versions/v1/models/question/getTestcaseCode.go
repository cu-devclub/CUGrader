package question

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func (m *QuestionModel) getCodeCollection() *mongo.Collection {
	return m.MongoDB.Database("cugrader").Collection("code")
}

func (m *QuestionModel) GetTestcaseCollection() *mongo.Collection {
	return m.MongoDB.Database("cugrader").Collection("testcase")
}

func (m *QuestionModel) GetCodeContent(ctx context.Context, objectID string) (string, error) {
	collection := m.getCodeCollection()
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

func (m *QuestionModel) GetTestcaseContent(ctx context.Context, testcaseObjectID string) (MultilangTestcase, error) {
	collection := m.GetTestcaseCollection()
	filter := bson.M{"_id": testcaseObjectID}

	var testcaseMongoObject TestcaseMongoModel
	err := collection.FindOne(ctx, filter).Decode(&testcaseMongoObject)
	if err != nil {
		return MultilangTestcase{}, err // Other error
	}

	inputCodeContent, err := m.GetCodeContent(ctx, testcaseMongoObject.Input)
	if err != nil {
		return MultilangTestcase{}, err
	}
	outputCodeContent, err := m.GetCodeContent(ctx, testcaseMongoObject.Output)
	if err != nil {
		return MultilangTestcase{}, err
	}

	return MultilangTestcase{
		Input:  inputCodeContent,
		Output: outputCodeContent,
	}, nil
}
