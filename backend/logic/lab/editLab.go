package lab

import "cugrader/repository/lab"

// EditLab updates the details of a lab based on the provided labID and labData.
// It updates fields such as number, name, publish status, due date, close on due status,
// exam mode, exam pin, and whether to show score on lock.
// The function returns an error if the update fails.
func EditLab(labID int, labData lab.LabEditModel) error {
	updateFields := make(map[string]any)

	if labData.Number != nil {
		updateFields["number"] = *labData.Number
	}
	if labData.Name != nil {
		updateFields["name"] = *labData.Name
	}
	if labData.Publish != nil {
		updateFields["publish"] = *labData.Publish
	}
	if labData.Due != nil {
		updateFields["due"] = *labData.Due
	}
	if labData.CloseOnDue != nil {
		updateFields["close_on_due"] = *labData.CloseOnDue
	}
	if labData.ExamMode != nil {
		updateFields["exam_mode"] = *labData.ExamMode
	}
	if labData.ExamPin != nil {
		updateFields["exam_pin"] = *labData.ExamPin
	}
	if labData.ShowScoreOnLock != nil {
		updateFields["show_score_on_lock"] = *labData.ShowScoreOnLock
	}

	if len(updateFields) == 0 {
		return nil // nothing to update
	}

	return lab.UpdateLab(labID, updateFields)
}
