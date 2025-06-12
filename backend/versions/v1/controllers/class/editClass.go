package class

import (
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (cc *ClassController) EditClassHandler(c *gin.Context) {
	authHeader := c.GetHeader("Authentication")
	claims, err := cc.Service.Utils.GetJWTClaims(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	classIDStr := c.PostForm("class_id")
	if classIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "class_id is required"})
		return
	}
	classID, err := strconv.Atoi(classIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class_id"})
		return
	}

	if allow := cc.Service.Utils.IsUserTeacherAdminOrAssistant(classID, claims.UserID); !allow {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "You dont have permission"})
		return
	}

	updates := make(map[string]interface{})

	if courseIDStr := c.PostForm("course_id"); courseIDStr != "" {
		courseID, err := strconv.Atoi(courseIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course_id"})
			return
		}
		updates["course_id"] = courseID
	}

	if name := c.PostForm("name"); name != "" {
		updates["name"] = name
	}

	if yearsemester := c.PostForm("semester"); yearsemester != "" {
		parts := strings.Split(yearsemester, "/")
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid semester"})
			return
		}

		updates["semester"] = semester
		updates["year"] = year
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

	err = cc.Service.EditClass(classID, imageFile, csvFile, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
