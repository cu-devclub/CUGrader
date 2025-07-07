package exampin

func (s *PinService) GetExamPin(labID int) (string, error) {
	pinData, err := s.Model.GetExamPinByLabID(labID)
	if err != nil {
		return "", err
	}
	return pinData.ExamPin, nil
}
