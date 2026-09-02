package system

import "cugrader/repository/system"

func GetLanguages() ([]system.Language, error) {
	return system.GetAllLanguages()
}
