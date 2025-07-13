package student

import (
	"cugrader/connection/db"
	"fmt"
	"strings"
)

func Edit(id int, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	var setClauses []string
	var args []interface{}

	for col, val := range updates {
		setClauses = append(setClauses, fmt.Sprintf(`%s = $%d`, col, len(args)+1))
		args = append(args, val)
	}

	args = append(args, id)

	query := fmt.Sprintf(`UPDATE class_student SET %s WHERE id = $%d`, strings.Join(setClauses, ", "), len(args))

	_, err := db.YSQL.Exec(query, args...)
	return err
}
