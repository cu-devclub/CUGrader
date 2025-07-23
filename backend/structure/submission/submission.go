package submission

import "go.mongodb.org/mongo-driver/bson/primitive"

type CodeStruct struct {
	PageName string `json:"page_name"`
	Content  string `json:"content"`
}

type SaveBody struct {
	LanguageId int          `json:"LanguageId"`
	QuestionId int          `json:"QuestionId"`
	Codes      []CodeStruct `json:"code"`
}

type Page struct {
	Name         string             `bson:"name" json:"name"`                     // must match bsonType: string
	CodeObjectID primitive.ObjectID `bson:"code_object_id" json:"code_object_id"` // must match bsonType: objectId
}

type LanguageInfo struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

type GetCode struct {
	SubmissionId int          `json:"SubmissionId"`
	Language     LanguageInfo `json:"language"`
	Codes        []CodeStruct `json:"code"`
}
