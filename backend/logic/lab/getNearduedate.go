package lab

import "cugrader/repository/lab"

func GetLabsNearDueDate(userID int, role string) ([]lab.NearDueDate, error) {
	labs, err := lab.GetLabsNearDueDateByRole(userID, role)
	if err != nil {
		return nil, err
	}
	if labs == nil {
		return []lab.NearDueDate{}, nil
	}
	return labs, nil
}
