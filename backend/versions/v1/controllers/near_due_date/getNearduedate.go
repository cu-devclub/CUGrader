package nearduedate

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (lc *NearDueDateController) GetNearDueDateHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := lc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if claims.Role != "teacher" && claims.Role != "admin" && claims.Role != "student" && claims.Role != "ta" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid role"})
		return
	}

	labs, err := lc.Service.GetLabsNearDueDate(claims.UserID, claims.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to get labs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"labs": labs})
}
