package lab

import (
	"fmt"
	"strings"
)

// UpdateLab updates the details of a lab based on the provided labID and updates.
func (m *LabModel) UpdateLab(labID int, updates map[string]any) error {
	if len(updates) == 0 {
		return nil // Nothing to update
	}

	setClauses := []string{}
	args := []any{}
	i := 1

	for k, v := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", k, i))
		args = append(args, v)
		i++
	}

	query := fmt.Sprintf(
		"UPDATE labs SET %s WHERE id = $%d",
		strings.Join(setClauses, ", "),
		i,
	)
	args = append(args, labID)

	_, err := m.DB.Exec(query, args...)
	return err
}
