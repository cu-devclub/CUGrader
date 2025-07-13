package student

import (
	gen "cugrader/api-gen"
	"cugrader/logic/student"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetStudentsHandler(c *gin.Context, classId gen.ClassId, params gen.GetStudentsIncClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(classId, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	students, err := student.GetStudentsByClassID(classId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, students)
}
