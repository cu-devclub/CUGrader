package assistant

import assistantModel "CUGrader/backend/versions/v1/models/assistant"

func (s *AssistantService) GetAssistantList(classID int) ([]assistantModel.Info, []assistantModel.Info, error) {
	return s.Model.GetAssistantsAndInstructors(classID)
}
