package class

import "cugrader/repository/class"

func GetAllSections(classId int) ([]int, error) {
	sections, err := class.GetAllSections(classId)
	if err != nil {
		return nil, err
	}
	if sections == nil {
		return []int{}, nil
	}
	return sections, nil
}

func GetSectionsForUser(classId int, userId int) ([]int, error) {
	sections, err := class.GetSectionsForUser(classId, userId)
	if err != nil {
		return nil, err
	}
	if sections == nil {
		return []int{}, nil
	}
	return sections, nil
}
