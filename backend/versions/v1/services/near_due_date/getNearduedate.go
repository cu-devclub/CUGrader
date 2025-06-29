package nearduedate

import nearduedateModel "CUGrader/backend/versions/v1/models/near_due_date"

func (s *NearDueDateService) GetLabsNearDueDate(userID int, role string) ([]nearduedateModel.NearDueDate, error) {
	return s.Model.GetLabsNearDueDateByRole(userID, role)
}
