package class

import (
	gen "cugrader/api-gen"
	"cugrader/logic/class"
	"cugrader/logic/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetSemesterHandler(c *gin.Context, params gen.GetSemesterOfUserParams) {
	claims, err := utils.GetJWTClaims(*params.Authentication)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or missing authentication token"})
		return
	}

	if claims.Role == "student" || claims.Role == "teacher" {
		semesters, err := class.GetSemestersForUser(claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve semesters"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"semesters": semesters})
		return
	}

	if claims.Role == "admin" {
		semesters, err := class.GetAllSemesters()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve semesters"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"semesters": semesters})
	}
}
