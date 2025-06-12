package class

import (
	"fmt"
	"strings"
)

func (m *ClassModel) Edit(id int, updates map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	var setClauses []string
	var args []interface{}

	for col, val := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = ?", col))
		args = append(args, val)
	}

	args = append(args, id)

	query := fmt.Sprintf("UPDATE class SET %s WHERE id = ?;", strings.Join(setClauses, ", "))
	fmt.Println("Executing query:", query, "with args:", args)
	_, err := m.DB.Exec(query, args...)
	return err
}
