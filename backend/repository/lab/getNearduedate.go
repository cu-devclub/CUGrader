package lab

import (
	"cugrader/connection/db"
	"database/sql"
)

func GetLabsNearDueDateByRole(userID int, role string) ([]NearDueDate, error) {
	baseQuery := `
	SELECT
		c.course_id,
		c.course_name,
		l.id AS lab_id,
		l.name AS lab_name,
		l.due AS lab_due,
		COALESCE(SUM(q.score), 0) AS lab_max_score
	FROM lab l
	JOIN class c ON l.class_id = c.id
	LEFT JOIN question q ON l.id = q.lab_id
	WHERE l.due > NOW()
	  AND l.due <= NOW() + INTERVAL '24 hours'
	`

	var rows *sql.Rows
	var err error

	switch role {
	case "admin":
		// no additional filter
		rows, err = db.YSQL.Query(baseQuery + `
		GROUP BY c.course_id, c.course_name, l.id, l.name, l.due
		ORDER BY l.due ASC
		`)

	case "teacher":
		rows, err = db.YSQL.Query(baseQuery+`
		AND c.id IN (
			SELECT class_id FROM class_teacher WHERE user_id = $1
		)
		GROUP BY c.course_id, c.course_name, l.id, l.name, l.due
		ORDER BY l.due ASC
		`, userID)

	case "ta":
		rows, err = db.YSQL.Query(baseQuery+`
	AND (
		c.id IN (
			SELECT class_id FROM class_assistant WHERE user_id = $1
		)
		OR l.id IN (
			SELECT a.lab_id
			FROM assign_to a
			JOIN group_student gs ON a.group_id = gs.group_id
			WHERE gs.student_id = $1
		)
	)
	GROUP BY c.course_id, c.course_name, l.id, l.name, l.due
	ORDER BY l.due ASC
	`, userID)

	case "student":
		rows, err = db.YSQL.Query(baseQuery+`
		AND l.id IN (
			SELECT a.lab_id
			FROM assign_to a
			JOIN group_student gs ON a.group_id = gs.group_id
			WHERE gs.student_id = $1
		)
		GROUP BY c.course_id, c.course_name, l.id, l.name, l.due
		ORDER BY l.due ASC
		`, userID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var labs []NearDueDate
	for rows.Next() {
		var lab NearDueDate
		if err := rows.Scan(&lab.CourseID, &lab.CourseName, &lab.LabID, &lab.LabName, &lab.LabDue, &lab.LabMaxScore); err != nil {
			return nil, err
		}
		labs = append(labs, lab)
	}
	return labs, nil
}
