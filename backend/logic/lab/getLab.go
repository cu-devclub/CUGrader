package lab

import (
	"cugrader/repository/lab"
	"cugrader/repository/system"
)

func GetLabs(classID int, userID int, role string) ([]lab.LabResponse, error) {
	return lab.GetLabsByClassID(classID, userID, role)
}

// GetLabByIdForStudent retrieves the lab details for a student by lab ID.
// This is less detailed than the full lab details and is intended to be returned to students.
func GetLabByIdForStudent(labId int) (*lab.LabStudentDetailModel, error) {
	labFull, err := lab.GetLab(labId)
	if err != nil {
		return nil, err
	}

	questionIds, err := lab.GetQuestionIdsByLabId(labId)
	if err != nil {
		return nil, err
	}

	languages, err := system.GetLanguageNameByLabId(labId)
	if err != nil {
		return nil, err
	}

	assignedGroups, err := lab.GetLabAssignedGroupNames(labId)
	if err != nil {
		return nil, err
	}

	additionalFileIDs, err := lab.GetFileIdByLabID(labId)
	if err != nil {
		return nil, err
	}

	lab := &lab.LabStudentDetailModel{
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

// GetLabByIdForInstructor retrieves the lab details for an instructor (teacher, admin, and TA) by lab ID.
// This is more detailed than the student version and includes additional information such as question IDs and languages.
func GetLabByIdForInstructor(labId int) (*lab.LabInstructorDetailModel, error) {
	labFull, err := lab.GetLab(labId)
	if err != nil {
		return nil, err
	}

	questionIds, err := lab.GetQuestionIdsByLabId(labId)
	if err != nil {
		return nil, err
	}

	languages, err := system.GetLanguageNameByLabId(labId)
	if err != nil {
		return nil, err
	}

	additionalFileIDs, err := lab.GetFileIdByLabID(labId)
	if err != nil {
		return nil, err
	}

	assignedGroups, err := lab.GetLabAssignedGroupNames(labId)
	if err != nil {
		return nil, err
	}

	lab := &lab.LabInstructorDetailModel{
		// sorted by apperance in API spec
		ClassID:                labFull.ClassID,
		ExamPin:                labFull.ExamPin,
		ShowScoreOnLock:        labFull.ShowScoreOnLock,
		TestcaseObjectID:       labFull.TestcaseObjectID,
		SecretTestcaseObjectID: labFull.SecretTestcaseObjectID,

		LabStudentDetailModel: lab.LabStudentDetailModel{
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
		},
	}

	return lab, nil
}
