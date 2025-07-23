package submission

import (
	"cugrader/logic/utils"
	"cugrader/repository/submission"
	submissionStruct "cugrader/structure/submission"
	"fmt"
)

func GetCode(QuestionId int, UserId int) (submissionStruct.GetCode, error) {
	CodeInfo := submissionStruct.GetCode{
		SubmissionId: 0,
		Language:     submissionStruct.LanguageInfo{},
		Codes:        []submissionStruct.CodeStruct{},
	}
	SubmissionId := submission.GetSubmissionId(QuestionId, UserId)
	if SubmissionId == 0 {
		return CodeInfo, nil
	}

	CodeInfo.SubmissionId = SubmissionId

	ObjectId, LangInfo, err := submission.GetSubmissionInfo(SubmissionId)
	if err != nil {
		return CodeInfo, fmt.Errorf("error while getting Submission Info: %w", err)
	}
	CodeInfo.Language = LangInfo

	pages, err := submission.GetPages(ObjectId)
	if err != nil {
		return CodeInfo, fmt.Errorf("error while getting pages: %w", err)
	}

	for _, page := range pages {
		content, err := utils.GetCodeContent(page.CodeObjectID.Hex())
		if err != nil {
			return CodeInfo, fmt.Errorf("error while getting page content: %w", err)
		}
		CodeInfo.Codes = append(CodeInfo.Codes, submissionStruct.CodeStruct{
			PageName: page.Name,
			Content:  content,
		})
	}

	return CodeInfo, nil
}
