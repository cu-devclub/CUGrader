package lab

import labModel "CUGrader/backend/versions/v1/models/lab"

func (s *LabService) GetLabs(classID int, userID int, role string) ([]labModel.LabResponse, error) {
	return s.Model.GetLabsByClassID(classID, userID, role)
}
