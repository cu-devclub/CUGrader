package assistant

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func (ac *AssistantController) RemoveAssistantHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
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

	err := ac.Service.RemoveAssistant(req.ClassID, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
