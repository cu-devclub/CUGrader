package utils

import "cugrader/repository/utils"

// IsStudentAssignedToQuestion checks if a student can access a question based on their user ID and the question ID.
// It checks if the question is assigned to a group that the student is part of.
func IsStudentAssignedToQuestion(questionID int, userID int) (bool, error) {
	// user_id -> class_student.user_id
	// class_student.group_id -> assign_to.group_id
	// assign_to.lab_id -> question.lab_id
	// if there exists a question with the given questionID that is assigned to a class that the user is part of, return true
	// if not, return false
	return utils.IsStudentAssignedToQuestion(questionID, userID)
}

// IsUserAnAssistantToQuestion checks if a user is an assistant for a specific question.
// It checks if the question is assigned to a class that the user is part of as an assistant.
func IsUserAnAssistantToQuestion(questionID int, userID int) (bool, error) {
	// user_id -> class_assistant.user_id
	// class_assistant.class_id -> lab.class_id
	// lab.id -> question.lab_id
	// if there exists a question with the given questionID that is assigned to a class that the user is part of, return true
	// if not, return false
	return utils.IsUserAnAssistantToQuestion(questionID, userID)
}

// IsStudentAssignedToLabID checks if a student can access a lab based on their user ID and the lab ID.
// It check if student is enrolled in the class that the lab belongs to.
func IsStudentAssignedToLabID(userID int, labID int) (bool, error) {
	return utils.IsStudentAssignedToLabID(userID, labID)
}

func IsStudentAssignedToLabByTestcaseID(userID int, testcaseID int) (bool, error) {
	return utils.IsStudentAssignedToLabByTestcaseID(userID, testcaseID)
}

func GetUserIDorInsert(Email string) (int, error) {
	return utils.GetUserIDorInsert(Email)
}

func IsUserAdminOrTeacher(userID int) bool {
	// Check if user is in teacher table
	return utils.IsUserAdminOrTeacher(userID)
}

func IsUserTeacherAdminOrAssistantByLabID(labID int, userID int) bool {
	// Check if user is an admin or teacher
	return utils.IsUserTeacherAdminOrAssistantByLabID(labID, userID)
}

func IsUserTeacherAdminOrAssistant(classID int, userID int) bool {
	// Check if user is an admin or teacher
	return utils.IsUserTeacherAdminOrAssistant(classID, userID)
}

func IsUserAnAssistantToTestcase(testcaseID int, userID int) (bool, error) {
	// Check if user is assistant in the class of the testcase
	return utils.IsUserAnAssistantToTestcase(testcaseID, userID)
}

func ClassIDExists(ClassId int) (bool, error) {
	return utils.ClassIDExists(ClassId)
}

func GetOrInsertSectionID(classID int, sectionNumber int) (int, error) {
	return utils.GetOrInsertSectionID(classID, sectionNumber)
}

func GetOrInsertGroupID(classID int, groupName string) (int, error) {
	return utils.GetOrInsertGroupID(classID, groupName)
}

func GetUserIDByEmail(email string) (int, error) {
	return utils.GetUserIDByEmail(email)
}

func GetClassIDWithStudentId(id int) (int, error) {
	return utils.GetClassIDWithStudentId(id)
}

func GetClassIDWithAssistantId(id int) (int, error) {
	return utils.GetClassIDWithAssistantId(id)
}

func IsUserCanAccessClass(ClassId int, UserId int) bool {
	return utils.IsUserCanAccessClass(ClassId, UserId)
}

func GenerateUUID() string {
	return utils.GenerateUUID()
}

func LabIDExists(LabId int) (bool, error) {
	return utils.LabIDExists(LabId)
}

func IsUserAnAssistantToLab(labID int, userID int) (bool, error) {
	return utils.IsUserAnAssistantToLab(labID, userID)
}

func IsUserAnAssistantToAddfile(addfileID int, userID int) (bool, error) {
	return utils.IsUserAnAssistantToAddfile(addfileID, userID)
}

func GetClassIDWithLabId(id int) (int, error) {
	return utils.GetClassIDWithLabId(id)
}

func UpdateCodeContentByID(id string, newContent string) error {
	return utils.UpdateCodeContentByID(id, newContent)
}

func UpdateMDContentByID(id string, newContent string) error {
	return utils.UpdateMDContentByID(id, newContent)
}

func InsertCodeToMongo(content string) (string, error) {
	return utils.InsertCodeToMongo(content)
}

func InsertMDToMongo(content string) (string, error) {
	return utils.InsertMDToMongo(content)
}

func InsertMultilangToMongo(inputId string, outputId string) (string, error) {
	return utils.InsertMultilangToMongo(inputId, outputId)
}

func QuestionIdExists(id int) (bool, error) {
	return utils.QuestionIdExists(id)
}

func SubmissionIdExists(id int) (bool, error) {
	return utils.SubmissionIdExists(id)
}

func IsStudentOwnSubmissionId(userId int, SubmissionId int) (bool, error) {
	return utils.IsStudentOwnSubmissionId(userId, SubmissionId)
}

func GetClassStudentIdWithQuestionIdAndUserId(QuestionId int, UserId int) (int, error) {
	return utils.GetClassStudentIdWithQuestionIdAndUserId(QuestionId, UserId)
}

func GetCodeContent(objectID string) (string, error) {
	return utils.GetCodeContent(objectID)
}

func DeleteCodeByID(objectID string) error {
	return utils.DeleteCodeByID(objectID)
}
