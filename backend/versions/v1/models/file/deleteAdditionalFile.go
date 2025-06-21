package file

func (m *AdditionalFileModel) DeleteAdditionalFileByID(additionalFileID int) error {
	_, err := m.DB.Exec("DELETE FROM addition_files WHERE id = $1", additionalFileID)
	return err
}
