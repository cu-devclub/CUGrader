package question

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (qc *QuestionController) GetQuestionForStudentController(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := qc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	questionIdStr := c.Param("questionId")
	questionId, err := strconv.Atoi(questionIdStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid question_id"})
		return
	}

	isStudentAssigned, err := qc.Service.Utils.IsStudentAssignedToQuestion(questionId, claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	isAdminOrTeacher := qc.Service.Utils.IsUserAdminOrTeacher(claims.UserID)
	isTeachingAssistant, err := qc.Service.Utils.IsUserAnAssistantToQuestion(questionId, claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	isInstructor := isAdminOrTeacher || isTeachingAssistant

	// If the user is an instructor, they can access the question without being assigned
	if isInstructor {
		question, err := qc.Service.GetQuestionByIDForInstructor(questionId)
		if err != nil {
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

	question, err := qc.Service.GetQuestionByIDForStudent(questionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if question == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
		return
	}

	c.JSON(http.StatusOK, question)
}
