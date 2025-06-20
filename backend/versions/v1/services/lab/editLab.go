package lab

import (
	labModel "CUGrader/backend/versions/v1/models/lab"
)

// EditLab updates the details of a lab based on the provided labID and labData.
// It updates fields such as number, name, publish status, due date, close on due status,
// exam mode, exam pin, and whether to show score on lock.
// The function returns an error if the update fails.
func (s *LabService) EditLab(labID int, labData labModel.LabEditModel) error {
	// TODO(ptsgrn): Fix on how we manage the testcase and question submission within the lab edit request
	return s.Model.UpdateLab(labID, map[string]interface{}{
		"number":             labData.Number,
		"name":               labData.Name,
		"publish":            labData.Publish,
		"due":                labData.Due,
		"close_on_due":       labData.CloseOnDue,
		"exam_mode":          labData.ExamMode,
		"exam_pin":           labData.ExamPin,
		"show_score_on_lock": labData.ShowScoreOnLock,
	})
}
