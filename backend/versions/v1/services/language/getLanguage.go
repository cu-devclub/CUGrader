package language

import languageModel "CUGrader/backend/versions/v1/models/language"

func (s *LanguageService) GetLanguages() ([]languageModel.Language, error) {
	return s.Model.GetAllLanguages()
}
