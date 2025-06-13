package class

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"
)

func (m *ClassModel) Edit(id int, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	var setClauses []string
	var args []interface{}

	i := 1
	for col, val := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, i))
		args = append(args, val)
		i++
	}

	args = append(args, id)
	query := fmt.Sprintf("UPDATE class SET %s WHERE id = $%d", strings.Join(setClauses, ", "), i)
	_, err := m.DB.Exec(query, args...)
	return err
}

func (m *ClassModel) GetPicturePathByClassID(classID int) (string, int, error) {
	var path sql.NullString
	var pictureID sql.NullInt64
	query := "SELECT picture.path, picture.id FROM class LEFT JOIN picture ON class.picture_id = picture.id WHERE class.id = $1"
	err := m.DB.QueryRow(query, classID).Scan(&path, &pictureID)
	if err != nil {
		return "", 0, err
	}
	if !pictureID.Valid {
		return "", 0, nil
	}
	if !path.Valid {
		return "", int(pictureID.Int64), nil
	}
	return path.String, int(pictureID.Int64), nil
}

func (m *ClassModel) UpdatePicturePath(pictureID int, path string) error {
	query := "UPDATE picture SET path = $1 WHERE id = $2"
	_, err := m.DB.Exec(query, path, pictureID)
	return err
}

// f1: Query class_student info for a class
func (m *ClassModel) GetClassStudentMap(classID int) (map[int]struct {
	Section string
	Group   string
}, error) {
	rows, err := m.DB.Query(`
		SELECT cs.id, s.section_number, g.group_name
		FROM class_student cs
		JOIN section s ON cs.section_id = s.id
		LEFT JOIN "group" g ON cs.group_id = g.id
		WHERE cs.class_id = $1
	`, classID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[int]struct {
		Section string
		Group   string
	})
	for rows.Next() {
		var id int
		var sectionNumber int
		var groupName *string
		if err := rows.Scan(&id, &sectionNumber, &groupName); err != nil {
			return nil, err
		}
		group := ""
		if groupName != nil {
			group = *groupName
		}
		result[id] = struct {
			Section string
			Group   string
		}{
			Section: strconv.Itoa(sectionNumber),
			Group:   group,
		}
	}
	return result, nil
}

// f2: Update section_id for class_student
func (m *ClassModel) UpdateClassStudentSection(classStudentID, sectionID int) error {
	_, err := m.DB.Exec(`UPDATE class_student SET section_id = $1 WHERE id = $2`, sectionID, classStudentID)
	return err
}

// f3: Update group_id for class_student
func (m *ClassModel) UpdateClassStudentGroup(classStudentID int, groupID *int) error {
	if groupID == nil {
		_, err := m.DB.Exec(`UPDATE class_student SET group_id = NULL WHERE id = $1`, classStudentID)
		return err
	}
	_, err := m.DB.Exec(`UPDATE class_student SET group_id = $1 WHERE id = $2`, *groupID, classStudentID)
	return err
}
