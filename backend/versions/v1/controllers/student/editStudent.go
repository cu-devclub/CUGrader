package student

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type EditStudentRequest struct {
	ID        int    `json:"id" binding:"required"`
	Section   string `json:"section,omitempty"`
	Group     string `json:"group,omitempty"`
	Withdrawn string `json:"withdrawn,omitempty"`
}

func (sc *StudentController) PatchStudentHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if err := sc.Utils.Verify_JWT(authHeader); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req EditStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
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

	err := sc.Service.EditStudent(req.ID, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
