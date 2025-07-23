package class

import "cugrader/connection/db"

func GetClassById(ClassId int) (ClassObjectModel, error) {
	query := `
		SELECT 
			c.id, 
			c.course_id, 
			c.name, 
			c.picture_id
		FROM
			class c
		WHERE 
			c.id = $1;
	`
	var class ClassObjectModel
	err := db.YSQL.QueryRow(query, ClassId).Scan(&class.ClassID, &class.CourseID, &class.CourseName, &class.Image)
	if err != nil {
		return ClassObjectModel{}, err
	}
	return class, nil
}
