package assistant

import "cugrader/repository/assistant"

func RemoveAssistant(classID int, email string) error {
	return assistant.Remove(classID, email)
}
