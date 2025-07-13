package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetNearDueDateHandler(c *gin.Context, params gen.GetNearDueDateLabsParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if claims.Role != "teacher" && claims.Role != "admin" && claims.Role != "student" && claims.Role != "ta" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid role"})
		return
	}

	labs, err := lab.GetLabsNearDueDate(claims.UserID, claims.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to get labs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"labs": labs})
}
