package student

import (
	gen "cugrader/api-gen"
	"cugrader/logic/student"
	"cugrader/logic/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PatchStudentHandler(c *gin.Context, params gen.EditStudentInClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var req EditStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	ClassId, err := utils.GetClassIDWithStudentId(req.StudentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Studnent not found"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(ClassId, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	err = student.EditStudent(req.StudentID, ClassId, req.Section, req.Group, req.Withdrawal)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
