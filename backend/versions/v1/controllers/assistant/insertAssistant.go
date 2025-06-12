package assistant

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (ac *AssistantController) InsertAssistantHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := ac.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	var req struct {
		ClassID int    `json:"class_id"`
		Email   string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.ClassID == 0 || req.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if allow := ac.Service.Utils.IsUserTeacherAdminOrAssistant(req.ClassID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	err = ac.Service.InsertAssistant(req.ClassID, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
