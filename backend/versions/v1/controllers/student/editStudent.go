package student

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type EditStudentRequest struct {
	ClassID   int    `json:"class_id" binding:"required"`
	StudentID int    `json:"student_id" binding:"required"`
	Section   string `json:"section,omitempty"`
	Group     string `json:"group,omitempty"`
	Withdrawn string `json:"withdrawn,omitempty"`
}

func (sc *StudentController) PatchStudentHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := sc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var req EditStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if allow := sc.Service.Utils.IsUserTeacherAdminOrAssistant(req.ClassID, claims.UserID); !allow {
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

	err = sc.Service.EditStudent(req.StudentID, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
