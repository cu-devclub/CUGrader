package student

import (
	"cugrader/logic/utils"
	"cugrader/repository/student"
	"fmt"
)

func AddStudent(ClassID int, Email string, Section int, Group string) error {
	SectionId, err := utils.GetOrInsertSectionID(ClassID, Section)
	if err != nil {
		return fmt.Errorf("having error while trying to get/insert section number")
	}

	GroupId, err := utils.GetOrInsertGroupID(ClassID, Group)
	if err != nil {
		return fmt.Errorf("having error while trying to get/insert group name")
	}

	return student.Add(ClassID, Email, SectionId, GroupId)
}
