package assistant

func (s *AssistantService) RemoveAssistant(classID int, email string) error {
	return s.Model.Remove(classID, email)
}
