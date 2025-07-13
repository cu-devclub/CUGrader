package student

import "cugrader/repository/student"

func EditStudent(id int, updates map[string]interface{}) error {
	return student.Edit(id, updates)
}
