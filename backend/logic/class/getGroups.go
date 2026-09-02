package class

import "cugrader/repository/class"

func GetGroups(classId int) ([]string, error) {
	groups, err := class.GetAllGroups(classId)
	if err != nil {
		return nil, err
	}
	if groups == nil {
		return []string{}, nil
	}
	return groups, nil
}
