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

	if claims.Role != "student" {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not allowed to access this resource"})
		return
	}

	isStudentAssigned, err := qc.Service.Model.IsStudentAssignedToQuestion(questionId, claims.UserID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

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
