package submission

import (
	gen "cugrader/api-gen"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetGradedReult(c *gin.Context, submissionId gen.SubmissionId, params gen.GetGradedReultParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}
