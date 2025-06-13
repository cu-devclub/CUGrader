package student

func (s *StudentService) EditStudent(id int, updates map[string]interface{}) error {
	return s.Model.Edit(id, updates)
}
