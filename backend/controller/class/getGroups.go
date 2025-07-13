package class

import (
	gen "cugrader/api-gen"
	"cugrader/logic/class"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetGroupsHandler(c *gin.Context, classId gen.ClassId, params gen.GetGroupsInClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	if claims.Role != "teacher" && claims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Forbidden: You do not have permission to access this resource"})
		return
	}

	groups, err := class.GetGroups(classId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve groups"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"groups": groups})
}
