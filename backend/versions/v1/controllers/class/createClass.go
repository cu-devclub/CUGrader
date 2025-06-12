package class

import (
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) CreateClassHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")

	claims, err := cc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	if claims.Role != "teacher" && claims.Role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "No permission"})
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
	// Check year is 4 digits and N is 1 digit
	if len(parts[0]) != 4 || len(parts[1]) != 1 {
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid semester", "e": parts[1]})
		return
	}

	var imageFile *multipart.FileHeader
	var csvFile *multipart.FileHeader

	imageFile, err = c.FormFile("image")
	if err != nil {
		imageFile = nil
	}

	csvFile, err = c.FormFile("students")
	if err != nil {
		csvFile = nil
	}

	creatorUserID := claims.UserID

	err = cc.Service.CreateClass(courseID, name, semester, year, imageFile, csvFile, creatorUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{})

}
