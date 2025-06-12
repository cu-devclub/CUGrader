package class

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) CreateClassHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	if err := cc.Utils.Verify_JWT(authHeader); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

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
	if semesterStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing semester"})
		return
	}
	parts := strings.Split(semesterStr, "/")
	if len(parts) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid semester format, expected YYYY/N"})
		return
	}
	year, err := strconv.Atoi(parts[0])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year"})
		return
	}
	semester, err := strconv.Atoi(parts[1])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid semester"})
		return
	}

	var pictureID *int
	imageFile, err := c.FormFile("image")
	if err == nil {
		savePath := "temp/" + imageFile.Filename
		if err := c.SaveUploadedFile(imageFile, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}
	}

	// Optional students CSV file
	_, _ = c.FormFile("students") // You can process this as needed

	// Dummy creatorUserID, replace with actual user ID from token
	creatorUserID := 1

	classID, err := cc.Service.CreateClass(courseID, name, semester, year, pictureID, creatorUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"class_id": classID})
}
