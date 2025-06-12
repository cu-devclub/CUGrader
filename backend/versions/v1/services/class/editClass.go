package class

func (s *ClassService) EditClass(id int, updates map[string]interface{}) error {
	return s.Model.Edit(id, updates)
}
