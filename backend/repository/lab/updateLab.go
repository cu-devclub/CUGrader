package lab

import (
	"cugrader/connection/db"
	"cugrader/logic/utils"
	"fmt"
	"strings"
)

// UpdateLab updates the details of a lab based on the provided labID and updates.
func UpdateLabInfo(labID int, updates map[string]any) error {
	if len(updates) == 0 {
		return nil // Nothing to update
	}

	setClauses := []string{}
	args := []any{}
	i := 1

	for k, v := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", k, i))
		args = append(args, v)
		i++
	}

	query := fmt.Sprintf(
		"UPDATE lab SET %s WHERE id = $%d",
		strings.Join(setClauses, ", "),
		i,
	)
	args = append(args, labID)

	_, err := db.YSQL.Exec(query, args...)
	return err
}

func UpdateLabLanguages(LabId int, LanguageIds []int) error {
	// Fetch current language IDs for the lab
	rows, err := db.YSQL.Query(`SELECT system_language_id FROM lab_language WHERE lab_id = $1`, LabId)
	if err != nil {
		return err
	}
	defer rows.Close()

	dbLangIds := map[int]struct{}{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return err
		}
		dbLangIds[id] = struct{}{}
	}

	// Prepare sets for input and db
	inputLangIds := map[int]struct{}{}
	for _, id := range LanguageIds {
		inputLangIds[id] = struct{}{}
	}

	// Insert new languages
	for id := range inputLangIds {
		if _, exists := dbLangIds[id]; !exists {
			_, err := db.YSQL.Exec(`INSERT INTO lab_language (lab_id, system_language_id) VALUES ($1, $2)`, LabId, id)
			if err != nil {
				return err
			}
		}
	}

	// Delete removed languages
	for id := range dbLangIds {
		if _, exists := inputLangIds[id]; !exists {
			_, err := db.YSQL.Exec(`DELETE FROM lab_language WHERE lab_id = $1 AND system_language_id = $2`, LabId, id)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func UpdateLabAssignTo(LabId int, GroupNames []string) error {
	ClassId, err := utils.GetClassIDWithLabId(LabId)
	if err != nil {
		return err
	}

	// Fetch current language IDs for the lab
	rows, err := db.YSQL.Query(`SELECT group_id FROM assign_to WHERE lab_id = $1`, LabId)
	if err != nil {
		return err
	}
	defer rows.Close()

	dbGroupIds := map[int]struct{}{}
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return err
		}
		dbGroupIds[id] = struct{}{}
	}

	// Prepare sets for input and db
	inputGroupIds := map[int]struct{}{}
	for _, name := range GroupNames {
		id, err := utils.GetOrInsertGroupID(ClassId, name)
		if err != nil {
			return err
		}
		inputGroupIds[id] = struct{}{}
	}

	// Insert new languages
	for id := range inputGroupIds {
		if _, exists := dbGroupIds[id]; !exists {
			_, err := db.YSQL.Exec(`INSERT INTO assign_to (lab_id, group_id) VALUES ($1, $2)`, LabId, id)
			if err != nil {
				return err
			}
		}
	}

	// Delete removed languages
	for id := range inputGroupIds {
		if _, exists := dbGroupIds[id]; !exists {
			_, err := db.YSQL.Exec(`DELETE FROM assign_to WHERE lab_id = $1 AND group_id = $2`, LabId, id)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func UpdateTestcase(labID int, content string) error {
	var ObjectID string
	err := db.YSQL.QueryRow("SELECT testcase_object_id FROM lab JOIN testcase ON testcase.id = lab.testcase_id WHERE lab.id = $1", labID).Scan(&ObjectID)
	if err != nil {
		return err
	}

	return utils.UpdateCodeContentByID(ObjectID, content)
}

func UpdateSecretTestcase(labID int, content string) error {
	var ObjectID string
	err := db.YSQL.QueryRow("SELECT secret_testcase_object_id FROM lab JOIN testcase ON testcase.id = lab.testcase_id WHERE lab.id = $1", labID).Scan(&ObjectID)
	if err != nil {
		return err
	}

	return utils.UpdateCodeContentByID(ObjectID, content)
}

func UpdateLabDescription(labID int, content string) error {
	var ObjectID string
	err := db.YSQL.QueryRow("SELECT description_object_id FROM lab WHERE id = $1", labID).Scan(&ObjectID)
	if err != nil {
		return err
	}

	return utils.UpdateMDContentByID(ObjectID, content)
}

func UpdateQuestionInfo(QuestionID int, updates map[string]any) error {
	if len(updates) == 0 {
		return nil // Nothing to update
	}

	setClauses := []string{}
	args := []any{}
	i := 1

	for k, v := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", k, i))
		args = append(args, v)
		i++
	}

	query := fmt.Sprintf(
		"UPDATE question SET %s WHERE id = $%d",
		strings.Join(setClauses, ", "),
		i,
	)
	args = append(args, QuestionID)

	_, err := db.YSQL.Exec(query, args...)
	return err
}

func UpdateQuestionDescription(QuestionID int, content string) error {
	var ObjectID string
	err := db.YSQL.QueryRow("SELECT description FROM question WHERE id = $1", QuestionID).Scan(&ObjectID)
	if err != nil {
		return err
	}

	return utils.UpdateMDContentByID(ObjectID, content)
}

func UpdateQuestionAnswer(QuestionID int, content string) error {
	var ObjectID string
	err := db.YSQL.QueryRow("SELECT answer FROM question WHERE id = $1", QuestionID).Scan(&ObjectID)
	if err != nil {
		return err
	}

	return utils.UpdateCodeContentByID(ObjectID, content)
}

func UpdateQuestionPredefine(QuestionID int, content string) error {
	var ObjectID string
	err := db.YSQL.QueryRow("SELECT predefine FROM question WHERE id = $1", QuestionID).Scan(&ObjectID)
	if err != nil {
		return err
	}

	return utils.UpdateCodeContentByID(ObjectID, content)
}

func UpdateQuestionTestcase(QuestionID int, content string) error {
	var ObjectID string
	err := db.YSQL.QueryRow("SELECT t.testcase_object_id FROM testcase t JOIN question q ON t.id = q.testcase_id WHERE q.id = $1", QuestionID).Scan(&ObjectID)
	if err != nil {
		return err
	}

	return utils.UpdateCodeContentByID(ObjectID, content)
}

func UpdateQuestionSecretTestcase(QuestionID int, content string) error {
	var ObjectID string
	err := db.YSQL.QueryRow("SELECT t.secret_testcase_object_id FROM testcase t JOIN question q ON t.id = q.testcase_id WHERE q.id = $1", QuestionID).Scan(&ObjectID)
	if err != nil {
		return err
	}

	return utils.UpdateCodeContentByID(ObjectID, content)
}
