package assistant

import "cugrader/repository/assistant"

func InsertAssistant(classID int, UserId int) error {
	return assistant.Insert(classID, UserId)
}
