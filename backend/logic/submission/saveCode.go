package submission

import (
	"cugrader/logic/utils"
	"cugrader/repository/submission"
	submissionStruct "cugrader/structure/submission"
	"fmt"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func SaveCodeToSystem(UserId int, Req submissionStruct.SaveBody) (int, error) {
	SubmissionId := submission.GetSubmissionId(Req.QuestionId, UserId)

	ClassStudentId, err := utils.GetClassStudentIdWithQuestionIdAndUserId(Req.QuestionId, UserId)
	if err != nil {
		return 0, fmt.Errorf("error while retrieving ClassStudentId: %w", err)
	}

	if SubmissionId == 0 {
		submissionDatas := []submissionStruct.Page{}
		for _, code := range Req.Codes {
			ObjectId, err := utils.InsertCodeToMongo(code.Content)
			if err != nil {
				return 0, fmt.Errorf("error inserting code to MongoDB: %w", err)
			}
			objectID, err := primitive.ObjectIDFromHex(ObjectId)
			if err != nil {
				return 0, fmt.Errorf("invalid ObjectID while converting after insert Code: %w", err)
			}
			submissionDatas = append(submissionDatas, submissionStruct.Page{
				Name:         code.PageName,
				CodeObjectID: objectID,
			})
		}
		ObjectId, err := submission.InsertSubmissionToMongo(submissionDatas)
		if err != nil {
			return 0, fmt.Errorf("error while insert submission to mongo: %w", err)
		}

		SubmissionId, err = submission.InsertSubmission(ClassStudentId, Req.QuestionId, Req.LanguageId, ObjectId)
		if err != nil {
			return 0, fmt.Errorf("error while insert submission to db: %w", err)
		}
		return SubmissionId, nil
	}

	ObjectId, err := submission.UpdateAndGetSavedCode(SubmissionId, Req.LanguageId)
	if err != nil {
		return SubmissionId, fmt.Errorf("error while getting object id: %w", err)
	}

	pages, err := submission.GetPages(ObjectId)
	if err != nil {
		return SubmissionId, fmt.Errorf("error while getting pages: %w", err)
	}

	FinalPages := []submissionStruct.Page{}
	DeleteMap := make(map[string]primitive.ObjectID)

	for _, page := range pages {
		DeleteMap[page.Name] = page.CodeObjectID
	}

	fmt.Println(DeleteMap)
	fmt.Println(Req.Codes)

	for _, code := range Req.Codes {
		if val, found := DeleteMap[code.PageName]; found {
			fmt.Println(found)
			FinalPages = append(FinalPages, submissionStruct.Page{Name: code.PageName, CodeObjectID: val})
			err := utils.UpdateCodeContentByID(DeleteMap[code.PageName].Hex(), code.Content)
			if err != nil {
				return 0, fmt.Errorf("error while update user code: %w", err)
			}
			delete(DeleteMap, code.PageName)
			continue
		}
		ObjectId, err := utils.InsertCodeToMongo(code.Content)
		if err != nil {
			return 0, fmt.Errorf("error inserting new code to MongoDB: %w", err)
		}
		objectID, err := primitive.ObjectIDFromHex(ObjectId)
		if err != nil {
			return 0, fmt.Errorf("invalid ObjectID while converting after insert new Code: %w", err)
		}
		FinalPages = append(FinalPages, submissionStruct.Page{
			Name:         code.PageName,
			CodeObjectID: objectID,
		})
	}

	err = submission.UpdateSubmissionContentByID(ObjectId, FinalPages)
	if err != nil {
		return 0, fmt.Errorf("error while update submission page list: %w", err)
	}

	for _, ObjId := range DeleteMap {
		err := utils.DeleteCodeByID(ObjId.Hex())
		if err != nil {
			return 0, fmt.Errorf("error while delete unused page: %w", err)
		}
	}

	return SubmissionId, nil
}
