package student

import (
	"cugrader/logic/utils"
	"cugrader/repository/student"
	"fmt"
)

func EditStudent(id int, ClassID int, Section *int, Group string, Withdrawal *bool) error {

	updates := make(map[string]interface{})

	if Section != nil {
		SectionId, err := utils.GetOrInsertSectionID(ClassID, *Section)
		if err != nil {
			return fmt.Errorf("having error while trying to get/insert section number")
		}
		updates["section_id"] = SectionId
	}
	if Group != "" {
		GroupId, err := utils.GetOrInsertGroupID(ClassID, Group)
		if err != nil {
			return fmt.Errorf("having error while trying to get/insert group name")
		}
		updates["group_id"] = GroupId
	}
	if Withdrawal != nil {
		updates["withdrawn"] = Withdrawal
	}

	if len(updates) == 0 {
		return nil
	}

	return student.Edit(id, updates)
}
