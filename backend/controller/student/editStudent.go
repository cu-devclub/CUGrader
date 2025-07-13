package student

import (
	gen "cugrader/api-gen"
	"cugrader/logic/student"
	"cugrader/logic/utils"
	"net/http"
	"strings"

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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(req.ClassID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	updates := make(map[string]interface{})

	// แปลงค่า section ถ้ามี
	if req.Section != "" {
		updates["section_id"] = req.Section
	}
	if req.Group != "" {
		updates["group_id"] = req.Group
	}
	if req.Withdrawn != "" {
		// แปลง string เป็น boolean
		withdrawnBool := false
		if strings.ToLower(req.Withdrawn) == "true" {
			withdrawnBool = true
		}
		updates["withdrawn"] = withdrawnBool
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No updates provided"})
		return
	}

	err = student.EditStudent(req.StudentID, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
