package lab

import "cugrader/repository/lab"

func GetExaminationPin(labId int) (string, error) {
	return lab.GetExaminationPin(labId)
}
