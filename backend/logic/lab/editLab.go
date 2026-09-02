package lab

import (
	"cugrader/logic/utils"
	"cugrader/repository/lab"
	labStuct "cugrader/structure/lab"
	"fmt"
)

// EditLab updates the details of a lab based on the provided labID and labData.
// It updates fields such as number, name, publish status, due date, close on due status,
// exam mode, exam pin, and whether to show score on lock.
// The function returns an error if the update fails.
func EditLab(labID int, labData labStuct.EditLabData) error {
	updateFields := make(map[string]any)
	if labData.LabNumber != nil {
		updateFields["number"] = *labData.LabNumber
	}
	if labData.Name != nil {
		updateFields["name"] = *labData.Name
	}
	if labData.PublishDate != nil {
		updateFields["publish"] = *labData.PublishDate
	}
	if labData.DueDate != nil {
		updateFields["due"] = *labData.DueDate
	}
	if labData.CloseOnDue != nil {
		updateFields["close_on_due"] = *labData.CloseOnDue
	}
	if labData.ExamMode != nil {
		updateFields["exam_mode"] = *labData.ExamMode
	}
	if labData.ExamPin != nil {
		updateFields["exam_pin"] = *labData.ExamPin
	}
	if labData.ShowScoreOnLock != nil {
		updateFields["show_score_on_lock"] = *labData.ShowScoreOnLock
	}
	if labData.LabScore != nil {
		updateFields["lab_testcase_score"] = *labData.LabScore
	}

	err := lab.UpdateLabInfo(labID, updateFields)
	if err != nil {
		fmt.Println(1)
		return err
	}

	if labData.LanguageIds != nil {
		err = lab.UpdateLabLanguages(labID, *labData.LanguageIds)
		if err != nil {
			fmt.Println(2)
			return err
		}
	}

	if labData.AssignTo != nil {
		err = lab.UpdateLabAssignTo(labID, *labData.AssignTo)
		if err != nil {
			fmt.Println(3)
			return err
		}
	}

	if labData.Testcase != nil {
		err = lab.UpdateTestcase(labID, *labData.Testcase)
		if err != nil {
			fmt.Println(4)
			return err
		}
	}

	if labData.SecretTestcase != nil {
		err = lab.UpdateSecretTestcase(labID, *labData.SecretTestcase)
		if err != nil {
			fmt.Println(5)
			return err
		}
	}

	if labData.Description != nil {
		err = lab.UpdateLabDescription(labID, *labData.Description)
		if err != nil {
			fmt.Println(6)
			return err
		}
	}

	for _, question := range *labData.Questions {
		if question.QuestionId == 0 {
			testcaseID, err := AddTestcase(*question.Testcase, *question.SecretTestcase)
			if err != nil {
				return err
			}

			descriptionID, err := utils.InsertMDToMongo(*question.Description)
			if err != nil {
				return err
			}

			answerID, err := utils.InsertCodeToMongo(*question.Answer)
			if err != nil {
				return err
			}

			predefineID, err := utils.InsertCodeToMongo(*question.Predefine)
			if err != nil {
				return err
			}

			QuestionId, err := lab.InsertQuestion(labID, *question.QuestionNumber, *question.Name, *question.Score, descriptionID, answerID, predefineID, testcaseID)
			if err != nil {
				return err
			}
			for _, multilangTestcase := range *question.MultilangTestcase {
				MultilangId, err := AddMultilangTestcase(multilangTestcase.Input, multilangTestcase.Output)
				if err != nil {
					return err
				}

				err = lab.InsertMultilangTestcase(QuestionId, MultilangId)
				if err != nil {
					return err
				}
			}

			for _, multilangSecretTestcase := range *question.MultilangSecretTestcase {
				MultilangId, err := AddMultilangTestcase(multilangSecretTestcase.Input, multilangSecretTestcase.Output)
				if err != nil {
					return err
				}

				err = lab.InsertMultilangSecretTestcase(QuestionId, MultilangId)
				if err != nil {
					return err
				}
			}

			continue
		}

		QupdateFields := make(map[string]any)
		if question.QuestionNumber != nil {
			QupdateFields["number"] = *question.QuestionNumber
		}
		if question.Name != nil {
			QupdateFields["name"] = *question.Name
		}
		if question.Score != nil {
			QupdateFields["score"] = *question.Score
		}
		err := lab.UpdateQuestionInfo(question.QuestionId, QupdateFields)
		if err != nil {
			return err
		}
		if question.Description != nil {
			err = lab.UpdateQuestionDescription(labID, *question.Description)
			if err != nil {
				return err
			}
		}
		if question.Answer != nil {
			err = lab.UpdateQuestionAnswer(labID, *question.Answer)
			if err != nil {
				return err
			}
		}
		if question.Predefine != nil {
			err = lab.UpdateQuestionPredefine(labID, *question.Predefine)
			if err != nil {
				return err
			}
		}
		if question.Testcase != nil {
			err = lab.UpdateQuestionTestcase(labID, *question.Testcase)
			if err != nil {
				return err
			}
		}
		if question.SecretTestcase != nil {
			err = lab.UpdateQuestionSecretTestcase(labID, *question.SecretTestcase)
			if err != nil {
				return err
			}
		}
	}

	return lab.UpdateLabInfo(labID, updateFields)
}
