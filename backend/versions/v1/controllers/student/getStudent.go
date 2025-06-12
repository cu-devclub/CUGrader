package student

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (sc *StudentController) GetStudentsHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if err := sc.Utils.Verify_JWT(authHeader); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	classIDStr := c.Query("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class_id"})
		return
	}

	students, err := sc.Service.GetStudentsByClassID(classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, students)
}
