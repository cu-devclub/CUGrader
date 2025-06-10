package class

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) GetSemesterHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if !strings.HasPrefix(authHeader, "Bearer ") || len(authHeader) <= 7 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// TODO: Validate the token

	// TODO: Implement this
	// semesters, err := cc.Service.Model.GetSemstersByUserId()
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve semesters"})
	// 	return
	// }
	semesters := []string{"2023-1", "2023-2", "2024-1"} // Example data, replace with actual logic
	c.JSON(http.StatusOK, gin.H{"semesters": semesters})
}
