package lab

import (
	"cugrader/connection/config"
	"cugrader/logic/utils"
	"cugrader/repository/lab"
	labStuct "cugrader/structure/lab"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
)

func AddLab(ClassId int, LabData labStuct.LabData, addfiles []*multipart.FileHeader) (int, error) {
	testcaseID, err := AddTestcase(LabData.Testcase, LabData.SecretTestcase)
	if err != nil {
		return 0, err
	}

	descriptionID, err := utils.InsertMDToMongo(LabData.Description)
	if err != nil {
		return 0, err
	}

	labID, err := lab.InsertLab(ClassId, LabData.LabNumber, LabData.Name, LabData.PublishDate, LabData.DueDate, LabData.CloseOnDue, LabData.ExamMode, LabData.ExamPin, LabData.ShowScoreOnLock, testcaseID, descriptionID, LabData.LabScore)
	if err != nil {
		return 0, err
	}

	for _, LanguageId := range LabData.LanguageIds {
		err = lab.InsertLang(labID, LanguageId)
		if err != nil {
			return labID, err
		}
	}

	for _, Group := range LabData.AssignTo {
		GroupId, err := utils.GetOrInsertGroupID(ClassId, Group)
		if err != nil {
			return labID, err
		}

		err = lab.InsertGroup(labID, GroupId)
		if err != nil {
			return labID, err
		}
	}

	for _, file := range addfiles {
		filename := file.Filename
		cleaned := filepath.Clean(filename)
		if strings.Contains(cleaned, "..") || strings.Contains(cleaned, "../") || strings.Contains(cleaned, `..\`) || strings.HasPrefix(cleaned, "/") || strings.HasPrefix(cleaned, `\`) {
			continue // Skip files with unsafe paths
		}

		ext := filepath.Ext(file.Filename)
		uuidName := fmt.Sprintf("%s%s", utils.GenerateUUID(), ext)
		savePath := filepath.Join(config.Path, uuidName)
		src, err := file.Open()
		if err != nil {
			return labID, fmt.Errorf("failed to open uploaded file: %v", err)
		}
		defer src.Close()

		dst, err := os.Create(savePath)
		if err != nil {
			return labID, fmt.Errorf("failed to create file: %v", err)
		}
		defer dst.Close()

		if _, err := io.Copy(dst, src); err != nil {
			return labID, fmt.Errorf("failed to save file: %v", err)
		}

		err = lab.InsertAddfile(labID, uuidName)
		if err != nil {
			return labID, fmt.Errorf("failed to insert picture to db: " + err.Error())
		}

	}

	for _, question := range LabData.Questions {
		testcaseID, err := AddTestcase(question.Testcase, question.SecretTestcase)
		if err != nil {
			return 0, err
		}

		descriptionID, err := utils.InsertMDToMongo(question.Description)
		if err != nil {
			return 0, err
		}

		answerID, err := utils.InsertCodeToMongo(question.Answer)
		if err != nil {
			return 0, err
		}

		predefineID, err := utils.InsertCodeToMongo(question.Predefine)
		if err != nil {
			return 0, err
		}

		QuestionId, err := lab.InsertQuestion(labID, question.QuestionNumber, question.Name, question.Score, descriptionID, answerID, predefineID, testcaseID)
		if err != nil {
			return 0, err
		}

		for _, multilangTestcase := range question.MultilangTestcase {
			MultilangId, err := AddMultilangTestcase(multilangTestcase.Input, multilangTestcase.Output)
			if err != nil {
				return 0, err
			}

			err = lab.InsertMultilangTestcase(QuestionId, MultilangId)
			if err != nil {
				return 0, err
			}
		}

		for _, multilangSecretTestcase := range question.MultilangSecretTestcase {
			MultilangId, err := AddMultilangTestcase(multilangSecretTestcase.Input, multilangSecretTestcase.Output)
			if err != nil {
				return 0, err
			}

			err = lab.InsertMultilangSecretTestcase(QuestionId, MultilangId)
			if err != nil {
				return 0, err
			}
		}
	}

	return labID, nil
}

func AddTestcase(testcase string, secret_testcase string) (int, error) {
	testcase_object_id, err := utils.InsertCodeToMongo(testcase)
	if err != nil {
		return 0, err
	}
	secret_testcase_object_id, err := utils.InsertCodeToMongo(secret_testcase)
	if err != nil {
		return 0, err
	}

	testcaseID, err := lab.InsertTestcase(testcase_object_id, secret_testcase_object_id)
	if err != nil {
		return 0, err
	}

	return testcaseID, nil
}

func AddMultilangTestcase(input string, output string) (string, error) {
	inputID, err := utils.InsertCodeToMongo(input)
	if err != nil {
		return "", err
	}
	outputID, err := utils.InsertCodeToMongo(output)
	if err != nil {
		return "", err
	}

	multilangID, err := utils.InsertMultilangToMongo(inputID, outputID)
	if err != nil {
		return "", err
	}

	return multilangID, nil
}
