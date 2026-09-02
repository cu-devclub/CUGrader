package submission

import (
	gen "cugrader/api-gen"
	"cugrader/logic/submission"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetGradedReult(c *gin.Context, submissionId gen.SubmissionId, params gen.GetGradedReultParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	exist, err := utils.SubmissionIdExists(submissionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error while checking existence of submissionId " + err.Error()})
	}
	if !exist {
		c.JSON(http.StatusNotFound, gin.H{"message": "Submission not found"})
	}

	owner, err := utils.IsStudentOwnSubmissionId(claims.UserID, submissionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error while checking owner of submissionId " + err.Error()})
	}
	if !owner {
		c.JSON(http.StatusForbidden, gin.H{"message": "You don't own this submission"})
	}

	result, err := submission.GetGradedReult(submissionId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error while geting test result " + err.Error()})
	}

	c.JSON(http.StatusOK, result)
}
