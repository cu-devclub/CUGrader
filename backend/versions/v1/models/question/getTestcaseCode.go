package question

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func (m *QuestionModel) getCodeCollection() *mongo.Collection {
	return m.MongoDB.Database("cugrader").Collection("code")
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
