package lab

import "cugrader/repository/lab"

func GetLabsNearDueDate(userID int, role string) ([]lab.NearDueDate, error) {
	return lab.GetLabsNearDueDateByRole(userID, role)
}
