package class

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) GetClassByYearSemesterHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")

	claims, err := cc.Service.Utils.GetJWTClaims(authHeader)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	yearSemester := c.Param("yearSemester")
	yearSemesterParts := strings.Split(yearSemester, "-")
	if len(yearSemesterParts) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid year-semester format"})
		return
	}
	year, err := strconv.Atoi(yearSemesterParts[0])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid year format"})
		return
	}
	semester, err := strconv.Atoi(yearSemesterParts[1])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid semester format"})
		return
	}

	if claims.Role == "student" || claims.Role == "teacher" {
		study, assistant, err := cc.Service.GetClassesByYearSemesterForUser(year, semester, claims.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve classes"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"assistant": assistant, "study": study})
		return
	}

	if claims.Role == "admin" {
		classes, err := cc.Service.Model.GetAllClasses()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve classes"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"classes": classes})
		return
	}

	c.JSON(http.StatusForbidden, gin.H{"message": "Forbidden: You do not have permission to access this resource"})
}
