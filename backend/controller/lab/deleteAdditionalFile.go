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
		c.JSON(http.StatusForbidden, gin.H{"message": "Forbidden: You do not have permission to delete this file"})
		return
	}

	err = lab.DeleteAdditionalFileByID(addFileId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Unable to delete additional file", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Additional file deleted successfully"})
}
