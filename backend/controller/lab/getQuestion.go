package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetQuestionForStudentController(c *gin.Context, questionId gen.QuestionId, params gen.GetQuestionInformationParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	isStudentAssigned, err := utils.IsStudentAssignedToQuestion(questionId, claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	isAdminOrTeacher := utils.IsUserAdminOrTeacher(claims.UserID)
	isTeachingAssistant, err := utils.IsUserAnAssistantToQuestion(questionId, claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	isInstructor := isAdminOrTeacher || isTeachingAssistant

	// If the user is an instructor, they can access the question without being assigned
	if isInstructor {
		question, err := lab.GetQuestionByIDForInstructor(questionId)
		if err != nil {
			fmt.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}

		if question == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
			return
		}

		c.JSON(http.StatusOK, question)
		return
	}

	// If the user is a student, check if they are assigned to the question
	if !isStudentAssigned {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not assigned to this question"})
		return
	}

	question, err := lab.GetQuestionByIDForStudent(questionId, claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error: " + err.Error()})
		return
	}
	if question == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	c.JSON(http.StatusOK, question)
}
