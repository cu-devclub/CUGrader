package student

import (
	"net/http"
	"strings"

	studentService "CUGrader/backend/versions/v1/services/student"

	"github.com/gin-gonic/gin"
)

func (sc *StudentController) AddStudentHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if !strings.HasPrefix(authHeader, "Bearer ") || len(authHeader) <= 7 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input studentService.StudentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	err := sc.Service.AddStudent(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
