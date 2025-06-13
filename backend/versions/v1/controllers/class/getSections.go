package class

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) GetSectionsHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")

	claims, err := cc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or missing authentication token"})
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

	if claims.Role == "student" {
		sections, err := cc.Service.GetSectionsForUser(classIdInt, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve sections"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"sections": sections})
		return
	}

	sections, err := cc.Service.GetAllSections(classIdInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve sections"})
		return
	}
	if len(sections) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No sections found for this class"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sections": sections})
}
