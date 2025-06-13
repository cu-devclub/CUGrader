package class

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) GetSemesterHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")

	claims, err := cc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or missing authentication token"})
		return
	}

	if claims.Role == "student" || claims.Role == "teacher" {
		semesters, err := cc.Service.GetSemestersForUser(claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve semesters"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"semesters": semesters})
		return
	}

	if claims.Role == "admin" {
		semesters, err := cc.Service.GetAllSemesters()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve semesters"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"semesters": semesters})
	}
}
