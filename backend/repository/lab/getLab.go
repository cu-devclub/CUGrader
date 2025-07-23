package lab

import (
	"cugrader/connection/db"
	"database/sql"
	"time"
)

// GetLab retrieves a lab data by its ID from the database.
func GetLab(labId int) (*LabFullModel, error) {
	lab := &LabFullModel{}
	query := `SELECT 
		l.id,
		l.class_id,
		l.number,
		l.name,
		l.publish,
		l.due,
		l.close_on_due,
		l.exam_mode,
		l.exam_pin,
		l.show_score_on_lock,
		l.description_object_id,
		l.testcase_id
	FROM lab l
	WHERE l.id = $1`
	row := db.YSQL.QueryRow(query, labId)
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
		&lab.Description,
		&lab.TestcaseID,
	); err != nil {
		return nil, err
	}

	Description, err := GetDescriptionByID(lab.Description)
	if err != nil {
		return nil, nil
	}

	lab.Description = Description

	return lab, nil
}

// GetLabStudentDetail retrieves detailed information about a lab for students, including questions, languages, and assigned groups.
func GetLabAssignedGroupNames(labId int) ([]string, error) {
	query := `SELECT DISTINCT g.group_name FROM "group" g LEFT JOIN assign_to at ON g.id = at.group_id WHERE at.lab_id = $1`
	rows, err := db.YSQL.Query(query, labId)
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

func GetLabsByClassID(classID int, userID int, role string) ([]LabResponse, error) {
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
		rows, err = db.YSQL.Query(query, classID, userID)
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
		rows, err = db.YSQL.Query(query, classID)
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
