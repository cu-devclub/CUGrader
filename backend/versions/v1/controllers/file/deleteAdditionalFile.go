package file

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (ac *AdditionalFileController) DeleteAdditionalFileByIDHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := ac.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if claims.Role != "admin" && claims.Role != "teacher" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Forbidden: You do not have permission to delete this file"})
		return
	}

	additionalFileIDStr := c.Param("addfile_id")
	if additionalFileIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Additional File ID is required"})
		return
	}

	additionalFileID, err := strconv.Atoi(additionalFileIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Additional File ID format"})
		return
	}

	err = ac.Service.DeleteAdditionalFileByID(additionalFileID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Unable to delete additional file", "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Additional file deleted successfully"})
}
