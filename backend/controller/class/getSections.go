package class

import (
	gen "cugrader/api-gen"
	"cugrader/logic/class"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetSectionsHandler(c *gin.Context, classId gen.ClassId, params gen.GetSectionInClassParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or missing authentication token"})
		return
	}

	if claims.Role == "student" {
		sections, err := class.GetSectionsForUser(classId, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve sections"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"sections": sections})
		return
	}

	sections, err := class.GetAllSections(classId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve sections"})
		return
	}
	if len(sections) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No sections found for this class"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"sections": sections})
}
