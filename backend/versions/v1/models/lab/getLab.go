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
