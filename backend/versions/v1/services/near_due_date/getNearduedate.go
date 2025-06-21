package nearduedate

import nearduedateModel "CUGrader/backend/versions/v1/models/near_due_date"

func (s *NearduedateService) GetAllLabsNearDue() ([]nearduedateModel.NearDueDate, error) {
	return s.Model.GetAllLabsNearDueDate()
}
