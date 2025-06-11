package class

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) GetClassByYearSemesterHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if !strings.HasPrefix(authHeader, "Bearer ") || len(authHeader) <= 7 {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// TODO: Validate the token

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
	classes, err := cc.Service.GetClassByYearSemester(year, semester)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve classes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"classes": classes})
}
