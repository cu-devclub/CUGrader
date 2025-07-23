package submission

import (
	gen "cugrader/api-gen"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GradeUsersCode(c *gin.Context, params gen.GradeUsersCodeParams) {
	c.JSON(http.StatusInternalServerError, gin.H{"message": "waiting for implement"})
}
