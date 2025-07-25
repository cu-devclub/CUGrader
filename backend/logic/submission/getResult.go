package submission

import (
	"cugrader/repository/submission"
	submissionStruct "cugrader/structure/submission"
)

func GetGradedReult(SubmissionId int) (submissionStruct.Result, error) {
	Result := submissionStruct.Result{}
	secret, err := submission.GetSecret(SubmissionId)
	if err != nil {
		return Result, err
	}
	Result.Secret = secret

	normal, err := submission.GetNormal(SubmissionId)
	if err != nil {
		return Result, err
	}

	Result.Normal = normal

	return Result, nil
}
