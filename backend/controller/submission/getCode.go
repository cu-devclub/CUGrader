package submission

import (
	gen "cugrader/api-gen"
	"cugrader/logic/submission"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCodeFromSystem(c *gin.Context, questionId gen.QuestionId, params gen.GetCodeFromSystemParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	exist, err := utils.QuestionIdExists(questionId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "error while checking question existence"})
		return
	}
	if !exist {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Question not found"})
		return
	}

	isStudentAssigned, err := utils.IsStudentAssignedToQuestion(questionId, claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if !isStudentAssigned {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not assigned to this question"})
		return
	}

	Codes, err := submission.GetCode(questionId, claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, Codes)
}
