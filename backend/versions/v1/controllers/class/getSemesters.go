package class

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) GetSemesterHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if !strings.HasPrefix(authHeader, "Bearer ") || len(authHeader) <= 7 {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// TODO: Validate the token

	semesters, err := cc.Service.GetAllSemesters()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve semesters"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"semesters": semesters})
}
