package lab

import (
	"database/sql"
	"time"
)

func (m *LabModel) GetLabsByClassID(classID int, userID int, role string) ([]LabResponse, error) {
	var rows *sql.Rows
	var err error

	if role == "student" {
		query := `
			SELECT
    			l.id, l.number, l.name, l.publish, l.due,
    			COALESCE(SUM(q.score), 0) AS max_score
			FROM lab l
			LEFT JOIN question q ON q.lab_id = l.id
			JOIN assign_to a ON a.lab_id = l.id
			JOIN class_student cs ON cs.class_id = l.class_id AND cs.user_id = $2
			WHERE l.class_id = $1 AND a.group_id = cs.group_id
			GROUP BY l.id
			ORDER BY l.number;
		`
		rows, err = m.DB.Query(query, classID, userID)
	} else {
		query := `
			SELECT
				l.id, l.number, l.name, l.publish, l.due,
				COALESCE(SUM(q.score), 0) AS max_score,
				'complete' AS status -- teacher/admin ไม่มีการส่งงาน
			FROM lab l
			LEFT JOIN question q ON q.lab_id = l.id
			WHERE l.class_id = $1
			GROUP BY l.id
			ORDER BY l.number;
		`
		rows, err = m.DB.Query(query, classID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var labs []LabResponse
	for rows.Next() {
		var lab LabResponse

		err := rows.Scan(
			&lab.LabID, &lab.LabNumber, &lab.LabName,
			&lab.Publish, &lab.Due, &lab.MaxScore,
		)
		if err != nil {
			return nil, err
		}

		lab.Status = "new"
		if time.Until(lab.Due) <= 24*time.Hour && lab.Due.After(time.Now()) {
			lab.Status = "due_soon"
		}

		lab.Score = 0
		labs = append(labs, lab)
	}

	return labs, nil
}

// GetLab retrieves a lab data by its ID from the database.
func (m *LabModel) GetLab(labId int) (*LabFullModel, error) {
	lab := &LabFullModel{}
	query := `SELECT 
		id,
		class_id,
		number,
		name,
		publish,
		due,
		close_on_due,
		exam_mode,
		exam_pin,
		show_score_on_lock,
		testcase_object_id,
		secret_testcase_object_id
	FROM lab
	WHERE id = ?`
	row := m.DB.QueryRow(query, labId)
	if err := row.Scan(
		&lab.ID,
		&lab.ClassID,
		&lab.Number,
		&lab.Name,
		&lab.Publish,
		&lab.Due,
		&lab.CloseOnDue,
		&lab.ExamMode,
		&lab.ExamPin,
		&lab.ShowScoreOnLock,
		&lab.TestcaseObjectID,
		&lab.SecretTestcaseObjectID,
	); err != nil {
		return nil, err
	}
	return lab, nil
}

// GetLabStudentDetail retrieves detailed information about a lab for students, including questions, languages, and assigned groups.
func (m *LabModel) GetLabAssignedGroupNames(labId int) ([]string, error) {
	query := `SELECT DISTINCT g.name FROM group g LEFT JOIN assign_to at ON g.id = at.group_id WHERE at.lab_id = ?`
	rows, err := m.DB.Query(query, labId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var groupNames []string
	for rows.Next() {
		var groupName string
		if err := rows.Scan(&groupName); err != nil {
			return nil, err
		}
		groupNames = append(groupNames, groupName)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return groupNames, nil
}
