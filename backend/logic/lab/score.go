package lab

import (
	"cugrader/repository/lab"
	labStruct "cugrader/structure/lab"
)

func GetLabScoreJSON(labID int) (labStruct.FinalLabScoreJSON, error) {
	return lab.GetLabScoreJSON(labID)
}
