package submission

import (
	gen "cugrader/api-gen"
	"cugrader/logic/submission"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GradeUsersCode(c *gin.Context, params gen.GradeUsersCodeParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var req struct {
		SubmissionId int `json:"SubmissionId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	exist, err := utils.SubmissionIdExists(req.SubmissionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error while checking existence of submissionId " + err.Error()})
	}
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{"message": "Submission not found"})
	}

	owner, err := utils.IsStudentOwnSubmissionId(claims.UserID, req.SubmissionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error while checking owner of submissionId " + err.Error()})
	}
	if !owner {
		c.JSON(http.StatusForbidden, gin.H{"message": "You don't own this submission"})
	}

	err = submission.GradeUsersCode(req.SubmissionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error while append queue " + err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"message": "Success"})
}
