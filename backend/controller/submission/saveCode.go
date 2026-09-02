package submission

import (
	gen "cugrader/api-gen"
	"cugrader/logic/submission"
	"cugrader/logic/utils"
	submissionStruct "cugrader/structure/submission"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SaveCodeToSystem(c *gin.Context, params gen.SaveCodeToSystemParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var req submissionStruct.SaveBody
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	exist, err := utils.QuestionIdExists(req.QuestionId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "error while checking question existence"})
		return
	}
	if !exist {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Question not found"})
		return
	}

	isStudentAssigned, err := utils.IsStudentAssignedToQuestion(req.QuestionId, claims.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if !isStudentAssigned {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not assigned to this question"})
		return
	}

	SubmissionId, err := submission.SaveCodeToSystem(claims.UserID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"SubmissionId": SubmissionId})
}
