package class

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) GetGroupsHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")

	claims, err := cc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}
	if claims.Role != "teacher" && claims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Forbidden: You do not have permission to access this resource"})
		return
	}

	classId := c.Param("classId")
	if classId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Class ID is required"})
		return
	}

	var classIdInt int
	_, err = fmt.Sscanf(classId, "%d", &classIdInt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Class ID format"})
		return
	}

	groups, err := cc.Service.GetGroups(classIdInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve groups"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"groups": groups})
}
