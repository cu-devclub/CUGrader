package assistant

import (
	assistantModel "CUGrader/backend/versions/v1/models/assistant"
	"strings"
)

func (s *AssistantService) GetAssistantList(classID int) ([]assistantModel.Info, []assistantModel.Info, error) {
	assistants, instructors, err := s.Model.GetAssistantsAndInstructors(classID)
	if err != nil {
		return nil, nil, err
	}

	var filteredAssistants []assistantModel.Info
	var movedToInstructors []assistantModel.Info

	for _, a := range assistants {
		if strings.HasSuffix(a.Email, "@chula.ac.th") {
			movedToInstructors = append(movedToInstructors, a)
		} else {
			filteredAssistants = append(filteredAssistants, a)
		}
	}

	// Combine original instructors with moved assistants
	// Remove duplicates based on Email before appending
	existing := make(map[string]bool)
	for _, inst := range instructors {
		existing[inst.Email] = true
	}
	for _, moved := range movedToInstructors {
		if !existing[moved.Email] {
			instructors = append(instructors, moved)
			existing[moved.Email] = true
		}
	}

	if len(filteredAssistants) == 0 {
		return []assistantModel.Info{}, instructors, nil
	}
	return filteredAssistants, instructors, nil
}
