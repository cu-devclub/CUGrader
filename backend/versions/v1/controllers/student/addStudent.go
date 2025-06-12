package student

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type StudentInput struct {
	ClassID   int  `json:"class_id"`
	Email     int  `json:"email"`
	SectionID int  `json:"section_id"`
	GroupID   *int `json:"group_id"` // optional
}

func (sc *StudentController) AddStudentHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := sc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var input StudentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if allow := sc.Service.Utils.IsUserTeacherAdminOrAssistant(input.ClassID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	err = sc.Service.AddStudent(input.ClassID, input.Email, input.SectionID, input.GroupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
