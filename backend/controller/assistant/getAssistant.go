package assistant

import (
	gen "cugrader/api-gen"
	"cugrader/logic/assistant"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAssistantListHandler(c *gin.Context, classId gen.ClassId, params gen.GetAssistantsInClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(classId, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	assistants, instructors, err := assistant.GetAssistantList(classId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"assistants":  assistants,
		"instructors": instructors,
	})
}
