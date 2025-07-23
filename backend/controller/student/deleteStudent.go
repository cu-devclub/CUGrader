package student

import (
	gen "cugrader/api-gen"
	"cugrader/logic/student"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeleteStudentHandler(c *gin.Context, StudentId gen.StudentId, params gen.DeleteStudentFromClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if StudentId <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	ClassId, err := utils.GetClassIDWithStudentId(StudentId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Studnent not found"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(ClassId, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	err = student.DeleteStudent(StudentId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
