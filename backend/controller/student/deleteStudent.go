package student

import (
	gen "cugrader/api-gen"
	"cugrader/logic/student"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeleteStudentHandler(c *gin.Context, params gen.DeleteStudentFromClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var req deleteStudentRequest

	if err := c.ShouldBindJSON(&req); err != nil || req.ClassID <= 0 || req.UserID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(req.ClassID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	err = student.DeleteStudent(req.ClassID, req.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
