package class

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) GetSections(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if !strings.HasPrefix(authHeader, "Bearer ") || len(authHeader) <= 7 {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// TODO: Validate the token

	classId := c.Param("classId")
	if classId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Class ID is required"})
		return
	}

	var classIdInt int
	_, err := fmt.Sscanf(classId, "%d", &classIdInt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Class ID format"})
		return
	}

	sections, err := cc.Service.GetSections(classIdInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve sections"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sections": sections})
}
