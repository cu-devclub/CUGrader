package lab

import labModel "CUGrader/backend/versions/v1/models/lab"

func (s *LabService) GetLabs(classID int, userID int, role string) ([]labModel.LabResponse, error) {
	return s.Model.GetLabsByClassID(classID, userID, role)
}

// GetLabByIdForStudent retrieves the lab details for a student by lab ID.
// This is less detailed than the full lab details and is intended to be returned to students.
func (s *LabService) GetLabByIdForStudent(labId int) (*labModel.LabStudentDetailModel, error) {
	labFull, err := s.Model.GetLab(labId)
	if err != nil {
		return nil, err
	}

	questionIds, err := s.QuestionModel.GetQuestionIdsByLabId(labId)
	if err != nil {
		return nil, err
	}

	languages, err := s.LanguageModel.GetLanguageNameByLabId(labId)
	if err != nil {
		return nil, err
	}

	assignedGroups, err := s.Model.GetLabAssignedGroups(labId)
	if err != nil {
		return nil, err
	}

	additionalFileIDs, err := s.AdditionalFileModel.GetFileIdByLabID(labId)
	if err != nil {
		return nil, err
	}

	lab := &labModel.LabStudentDetailModel{
		// sorted by apperance in API spec
		AdditionalFiles: additionalFileIDs,
		QuestionIDs:     questionIds,
		Number:          labFull.Number,
		Name:            labFull.Name,
		Publish:         labFull.Publish,
		Due:             labFull.Due,
		Language:        languages,
		ExamMode:        labFull.ExamMode,
		CloseOnDue:      labFull.CloseOnDue,
		AssignTo:        assignedGroups,
	}

	return lab, nil
}
