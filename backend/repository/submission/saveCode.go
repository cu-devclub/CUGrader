package submission

import (
	"context"
	"cugrader/connection/db"
	submissionStruct "cugrader/structure/submission"
	"database/sql"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetSubmissionId(QuestionId int, UserId int) int {
	var submissionId int
	query := `SELECT 
			s.id 
		FROM 
			submission s
			INNER JOIN class_student cs on cs.id = s.class_student_id
		WHERE 
			cs.user_id = $1 AND s.question_id = $2`
	row := db.YSQL.QueryRow(query, UserId, QuestionId)
	if err := row.Scan(&submissionId); err != nil {
		if err == sql.ErrNoRows {
			return 0
		}
		fmt.Println(err.Error())
		return 0
	}
	return submissionId
}

func InsertSubmissionToMongo(content []submissionStruct.Page) (string, error) {
	collection := db.MongoClient.Database("cugrader").Collection("submission")
	doc := bson.M{"pages": content}
	result, err := collection.InsertOne(context.Background(), doc)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func InsertSubmission(ClassStudentId int, QuestionId int, LanguageId int, Objectid string) (int, error) {
	query := `INSERT INTO submission (
		class_student_id,
		question_id,
		system_language_id,
		object_id
	) VALUES ($1, $2, $3, $4)
	RETURNING id`

	var SubmissionID int
	err := db.YSQL.QueryRow(query, ClassStudentId, QuestionId, LanguageId, Objectid).Scan(&SubmissionID)
	if err != nil {
		return 0, err
	}
	return SubmissionID, nil
}

func UpdateAndGetSavedCode(SubmissionId int, LangId int) (string, error) {
	var objectId string
	err := db.YSQL.QueryRow(`
		UPDATE 
			submission
		SET system_language_id = $1
		WHERE 
			id = $2
		RETURNING object_id
	`, LangId, SubmissionId).Scan(&objectId)
	if err != nil {
		return "", err
	}

	return objectId, nil
}

// get list of page
func GetPages(objectID string) ([]submissionStruct.Page, error) {
	objectId, err := primitive.ObjectIDFromHex(objectID)
	if err != nil {
		return nil, fmt.Errorf("invalid ObjectID: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.MongoClient.Database("cugrader").Collection("submission")
	filter := bson.M{"_id": objectId}

	var result struct {
		Pages []submissionStruct.Page `bson:"pages"`
	}

	err = collection.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // No code found
		}
		return nil, err
	}

	return result.Pages, nil
}

// update list
func UpdateSubmissionContentByID(id string, pages []submissionStruct.Page) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid ObjectID: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.MongoClient.Database("cugrader").Collection("submission")

	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{"pages": pages}}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}
