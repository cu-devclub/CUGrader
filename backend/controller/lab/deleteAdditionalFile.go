package lab

import (
	gen "cugrader/api-gen"
	"cugrader/logic/lab"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeleteAdditionalFileByIDHandler(c *gin.Context, addFileId gen.AddFileId, params gen.DeleteAdditionalFileParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if claims.Role != "admin" && claims.Role != "teacher" {
		isTeachingAssistant, err := utils.IsUserAnAssistantToAddfile(addFileId, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		if !isTeachingAssistant {
			c.JSON(http.StatusForbidden, gin.H{"message": "Forbidden: You do not have permission to delete this file"})
			return
		}
	}

	err = lab.DeleteAdditionalFileByID(addFileId)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"message": "Additional file not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Unable to delete additional file: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Additional file deleted successfully"})
}
