package assistant

import (
	gen "cugrader/api-gen"
	"cugrader/logic/assistant"
	"net/http"

	"cugrader/logic/utils"

	"github.com/gin-gonic/gin"
)

func RemoveAssistantHandler(c *gin.Context, assistantId gen.AssistantId, params gen.DeleteAssistantFromClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	ClassId, err := utils.GetClassIDWithAssistantId(assistantId)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Assistant not found"})
		return
	}

	if allow := utils.IsUserTeacherAdminOrAssistant(ClassId, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	err = assistant.RemoveAssistant(assistantId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
