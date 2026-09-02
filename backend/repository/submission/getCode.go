package submission

import (
	"cugrader/connection/db"
	submissionStruct "cugrader/structure/submission"
	"fmt"
)

func GetSubmissionInfo(SubmissionId int) (string, submissionStruct.LanguageInfo, error) {
	var ObjectID string
	var LangInfo submissionStruct.LanguageInfo
	query := `SELECT 
			s.object_id,
			sl.id,
			sl.name
		FROM 
			submission s
			LEFT JOIN system_language sl ON s.system_language_id = sl.id
		WHERE 
			s.id = $1`
	row := db.YSQL.QueryRow(query, SubmissionId)
	if err := row.Scan(&ObjectID, &LangInfo.Id, &LangInfo.Name); err != nil {
		fmt.Println(err.Error())
		return "", submissionStruct.LanguageInfo{}, err
	}
	return ObjectID, LangInfo, nil
}
