package lab

import "time"

func (m *LabModel) InsertLab(classID int, questionNumber int, name string, publishDate time.Time, dueDate time.Time, closeOnDueDate bool, examMode bool, showScoreOnLock bool, examPin int, testcaseID int) (int, error) {
	query := `INSERT INTO lab (
		class_id,
		number,
		name,
		publish,
		due,
		close_on_due,
		exam_mode,
		exam_pin,
		show_score_on_lock,
		testcase_id
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	RETURNING id`

	var labID int
	err := m.DB.QueryRow(query, classID, questionNumber, name, publishDate, dueDate, closeOnDueDate, examMode, examPin, showScoreOnLock, testcaseID).Scan(&labID)
	if err != nil {
		return 0, err
	}
	return labID, nil
}
