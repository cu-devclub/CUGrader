package assistant

func (s *AssistantService) InsertAssistant(classID int, email string) error {

	return s.Model.Insert(classID, email)
}
