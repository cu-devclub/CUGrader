package assistant

import "cugrader/repository/assistant"

func InsertAssistant(classID int, email string) error {
	return assistant.Insert(classID, email)
}
