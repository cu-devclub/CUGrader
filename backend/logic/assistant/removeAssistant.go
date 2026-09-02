package assistant

import "cugrader/repository/assistant"

func RemoveAssistant(AssistantId int) error {
	return assistant.Remove(AssistantId)
}
