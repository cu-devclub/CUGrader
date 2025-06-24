package lab

func (c *LabModel) CanStudentAccessLab(labID int, userID int) (bool, error) {
	query := `SELECT EXISTS (
		SELECT 1 FROM class_student cs
		INNER JOIN lab l on cs.class_id = l.class_id
		WHERE cs.user_id = $1 AND l.id = $2)`
	var exists bool
	err := c.DB.QueryRow(query, userID, labID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
