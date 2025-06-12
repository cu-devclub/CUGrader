package assistant

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (ac *AssistantController) GetAssistantListHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := ac.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// ดึง class_id จาก query string หรือ path param
	classIDStr := c.Query("class_id")
	if classIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing class_id"})
		return
	}
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class_id"})
		return
	}

	if allow := ac.Service.Utils.IsUserTeacherAdminOrAssistant(classID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	assistants, instructors, err := ac.Service.GetAssistantList(classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"assistants":  assistants,
		"instructors": instructors,
	})
}
