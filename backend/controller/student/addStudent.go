package student

import (
	gen "cugrader/api-gen"
	"cugrader/logic/student"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AddStudentHandler(c *gin.Context, params gen.InsertStudentToClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var input StudentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(input.ClassID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	err = student.AddStudent(input.ClassID, input.Email, input.SectionID, input.GroupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
