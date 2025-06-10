package class

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	classService "CUGrader/backend/versions/v1/services/class"
)

type ClassController struct {
	Service *classService.ClassService
}

func (cc *ClassController) CreateClassHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if !strings.HasPrefix(authHeader, "Bearer ") || len(authHeader) <= 7 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	// You may want to validate the token here

	courseIDStr := c.PostForm("course_id")
	name := c.PostForm("name")
	semesterStr := c.PostForm("semester")

	if courseIDStr == "" || name == "" || semesterStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	courseID, err := strconv.Atoi(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course_id"})
		return
	}

	semester, err := strconv.Atoi(semesterStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid semester"})
		return
	}

	// Optional image file
	var pictureID *int

	// imageFile, err := c.FormFile("image")
	_, err = c.FormFile("image")

	if err == nil {
		// Save or process the image file as needed, then get pictureID
		// For now, just set pictureID to nil or a dummy value
		// pictureID = &someID
	}

	// Optional students CSV file
	_, _ = c.FormFile("students") // You can process this as needed

	// Dummy creatorUserID, replace with actual user ID from token
	creatorUserID := 1

	classID, err := cc.Service.CreateClass(courseID, name, semester, 0, pictureID, creatorUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"class_id": classID})
}
