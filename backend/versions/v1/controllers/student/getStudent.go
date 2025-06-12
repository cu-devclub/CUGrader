package student

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (sc *StudentController) GetStudentsHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := sc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	classIDStr := c.Query("class_id")
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class_id"})
		return
	}

	if allow := sc.Service.Utils.IsUserTeacherAdminOrAssistant(classID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	students, err := sc.Service.GetStudentsByClassID(classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, students)
}
