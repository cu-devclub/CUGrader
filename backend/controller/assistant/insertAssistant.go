package assistant

import (
	gen "cugrader/api-gen"
	"cugrader/logic/assistant"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func InsertAssistantHandler(c *gin.Context, params gen.InsertAssistantToClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var req struct {
		ClassID int    `json:"ClassId"`
		Email   string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.ClassID == 0 || req.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(req.ClassID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	UserId, err := utils.GetUserIDorInsert(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = assistant.InsertAssistant(req.ClassID, UserId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
